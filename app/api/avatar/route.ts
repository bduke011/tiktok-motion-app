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
    console.log("=== AVATAR API CALLED ===");

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
    const creditCheck = await checkCredits(session.user.id, "avatar");
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

    const { prompt, mode, sourceImageUrl } = await request.json();

    console.log("Request params:", {
      prompt,
      mode,
      hasSourceImage: !!sourceImageUrl,
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (mode === "edit" && !sourceImageUrl) {
      return NextResponse.json(
        { error: "Source image is required for edit mode" },
        { status: 400 }
      );
    }

    // Determine model path and input
    const isEditMode = mode === "edit" && sourceImageUrl;
    const modelPath = isEditMode
      ? "fal-ai/nano-banana-pro/edit"
      : "fal-ai/nano-banana-pro";

    const input = isEditMode
      ? { image_urls: [sourceImageUrl], prompt }
      : { prompt };

    console.log("Using model:", modelPath);

    let result;

    try {
      // Submit to fal.ai queue
      const queueResponse = await fetch(`https://queue.fal.run/${modelPath}`, {
        method: "POST",
        headers: {
          Authorization: `Key ${falKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
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
    console.log("Fal.ai result:", JSON.stringify(result, null, 2));

    // Handle response - check various possible structures
    const resultObj = result as Record<string, unknown>;
    let images: Array<{ url: string }> = [];

    if (Array.isArray(resultObj?.images)) {
      images = resultObj.images as Array<{ url: string }>;
    } else if (resultObj?.data && Array.isArray((resultObj.data as Record<string, unknown>)?.images)) {
      images = (resultObj.data as Record<string, unknown>).images as Array<{ url: string }>;
    }

    console.log("Extracted images count:", images.length);
    console.log("Image URLs:", images.map((img) => img.url));

    if (images.length === 0) {
      console.error("No images found in result structure");
      return NextResponse.json(
        { error: "No images generated", debug: { resultKeys: Object.keys(result || {}) } },
        { status: 500 }
      );
    }

    // Extract image URLs
    const imageUrls = images.map((img) => img.url).filter(Boolean);
    console.log("Final image URLs:", imageUrls);

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: "Images found but no URLs extracted" },
        { status: 500 }
      );
    }

    // Deduct credits after successful generation
    const deductResult = await deductCredits(session.user.id, "avatar");
    console.log("Credits deducted, remaining:", deductResult.remainingCredits);

    // Save to database
    try {
      const avatarGeneration = await prisma.avatarGeneration.create({
        data: {
          userId: session.user.id,
          mode: mode || "create",
          prompt: prompt,
          sourceImageUrl: sourceImageUrl || null,
          images: {
            create: imageUrls.map((url) => ({ url })),
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
        images: imageUrls,
        creditsRemaining: deductResult.remainingCredits,
      });
    } catch (dbError) {
      console.error("Database save error:", dbError);
      // Still return the images even if DB save fails
      return NextResponse.json({
        success: true,
        images: imageUrls,
        creditsRemaining: deductResult.remainingCredits,
        warning: "Images generated but failed to save to history",
      });
    }
  } catch (error) {
    console.error("Avatar generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate avatar: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's avatar generations
    const generations = await prisma.avatarGeneration.findMany({
      where: { userId: session.user.id },
      include: { images: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ generations });
  } catch (error) {
    console.error("Error fetching avatars:", error);
    return NextResponse.json(
      { error: "Failed to fetch avatars" },
      { status: 500 }
    );
  }
}
