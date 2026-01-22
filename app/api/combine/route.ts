import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkCredits, deductCredits } from "@/lib/credits";

// Increase timeout for this route (image generation can take a while)
export const maxDuration = 300; // 5 minutes
export const dynamic = "force-dynamic";

// Helper to poll for fal.ai result using URLs from queue response
async function pollForResult(
  statusUrl: string,
  responseUrl: string,
  falKey: string,
  maxAttempts = 90
): Promise<Record<string, unknown>> {
  console.log(`Starting poll with status URL: ${statusUrl}`);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const statusResponse = await fetch(statusUrl, {
      headers: { Authorization: `Key ${falKey}` },
    });

    if (!statusResponse.ok) {
      console.error(`Status check failed: ${statusResponse.status}`);
      const errorText = await statusResponse.text();
      console.error(`Status error body: ${errorText}`);
      throw new Error(`Status check failed: ${statusResponse.status}`);
    }

    const statusData = await statusResponse.json();
    console.log(`Poll attempt ${attempt + 1}:`, statusData.status);

    if (statusData.status === "COMPLETED") {
      console.log(`Fetching result from: ${responseUrl}`);

      const resultResponse = await fetch(responseUrl, {
        headers: { Authorization: `Key ${falKey}` },
      });

      if (!resultResponse.ok) {
        console.error(`Result fetch failed: ${resultResponse.status}`);
        const errorText = await resultResponse.text();
        console.error(`Result error body: ${errorText}`);
        throw new Error(`Result fetch failed: ${resultResponse.status}`);
      }

      const result = await resultResponse.json();
      console.log(`Got result with keys: ${Object.keys(result)}`);
      return result;
    }

    if (statusData.status === "FAILED") {
      console.error("Generation failed:", statusData);
      throw new Error(statusData.error || "Generation failed");
    }
  }

  throw new Error("Generation timed out");
}

export async function POST(request: Request) {
  try {
    console.log("=== COMBINE API CALLED ===");

    const falKey = process.env.FAL_KEY;
    if (!falKey) {
      console.error("FAL_KEY is not set!");
      return NextResponse.json(
        { error: "Server configuration error: Missing API key" },
        { status: 500 }
      );
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check credits before generation
    const creditCheck = await checkCredits(session.user.id, "combine");
    if (!creditCheck.hasCredits) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          creditsRequired: creditCheck.required,
          creditsAvailable: creditCheck.currentCredits,
          upgrade: true,
        },
        { status: 403 }
      );
    }

    const { prompt, imageUrls } = await request.json();

    console.log("Request params:", {
      prompt,
      imageCount: imageUrls?.length,
    });

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!imageUrls || imageUrls.length < 2) {
      return NextResponse.json(
        { error: "At least 2 images are required" },
        { status: 400 }
      );
    }

    if (imageUrls.length > 4) {
      return NextResponse.json(
        { error: "Maximum 4 images allowed" },
        { status: 400 }
      );
    }

    // Use nano-banana-pro/edit with multiple images
    const modelPath = "fal-ai/nano-banana-pro/edit";

    console.log("Using model:", modelPath);
    console.log("Image URLs:", imageUrls);

    let result;

    try {
      // Submit to fal.ai queue
      const queueResponse = await fetch(`https://queue.fal.run/${modelPath}`, {
        method: "POST",
        headers: {
          Authorization: `Key ${falKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_urls: imageUrls,
          prompt: prompt,
        }),
      });

      console.log("Queue response status:", queueResponse.status);

      if (!queueResponse.ok) {
        const errorText = await queueResponse.text();
        console.error("Queue error:", errorText);
        return NextResponse.json(
          { error: `fal.ai error: ${queueResponse.status} - ${errorText}` },
          { status: 500 }
        );
      }

      const queueData = await queueResponse.json();
      console.log("Queue response:", JSON.stringify(queueData, null, 2));

      // Use URLs from queue response
      const statusUrl = queueData.status_url;
      const responseUrl = queueData.response_url;

      if (!statusUrl || !responseUrl) {
        throw new Error("Missing status_url or response_url in queue response");
      }

      // Poll for result using the URLs from the queue response
      result = await pollForResult(statusUrl, responseUrl, falKey);
      console.log("Generation completed successfully");
    } catch (falError: unknown) {
      console.error("FAL.AI ERROR:", falError);
      const errorMessage =
        falError instanceof Error ? falError.message : String(falError);
      return NextResponse.json(
        { error: `AI generation failed: ${errorMessage}` },
        { status: 500 }
      );
    }

    console.log("Fal.ai raw result keys:", Object.keys(result || {}));

    // Handle response - check various possible structures
    const resultObj = result as Record<string, unknown>;
    let images: Array<{ url: string }> = [];

    if (Array.isArray(resultObj?.images)) {
      images = resultObj.images as Array<{ url: string }>;
    } else if (
      resultObj?.data &&
      Array.isArray((resultObj.data as Record<string, unknown>)?.images)
    ) {
      images = (resultObj.data as Record<string, unknown>)
        .images as Array<{ url: string }>;
    }

    console.log("Extracted images count:", images.length);

    if (images.length === 0) {
      console.error("No images found in result structure");
      return NextResponse.json(
        {
          error: "No images generated",
          debug: { resultKeys: Object.keys(result || {}) },
        },
        { status: 500 }
      );
    }

    // Extract image URLs
    const outputImageUrls = images.map((img) => img.url).filter(Boolean);
    console.log("Final image URLs:", outputImageUrls);

    if (outputImageUrls.length === 0) {
      return NextResponse.json(
        { error: "Images found but no URLs extracted" },
        { status: 500 }
      );
    }

    // Deduct credits after successful generation
    const deductResult = await deductCredits(session.user.id, "combine");
    console.log("Credits deducted, remaining:", deductResult.remainingCredits);

    // Save to database as an avatar generation with mode "combine"
    try {
      const avatarGeneration = await prisma.avatarGeneration.create({
        data: {
          userId: session.user.id,
          mode: "combine",
          prompt: prompt,
          sourceImageUrl: imageUrls[0], // Store first source image
          images: {
            create: outputImageUrls.map((url) => ({ url })),
          },
        },
        include: {
          images: true,
        },
      });

      console.log("Saved to database successfully");

      return NextResponse.json({
        success: true,
        generation: avatarGeneration,
        images: outputImageUrls,
        creditsRemaining: deductResult.remainingCredits,
      });
    } catch (dbError) {
      console.error("Database save error:", dbError);
      // Still return the images even if DB save fails
      return NextResponse.json({
        success: true,
        images: outputImageUrls,
        creditsRemaining: deductResult.remainingCredits,
        warning: "Images generated but failed to save to history",
      });
    }
  } catch (error) {
    console.error("Combine generation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to combine images: ${errorMessage}` },
      { status: 500 }
    );
  }
}
