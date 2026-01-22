import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      prompt,
      characterOrientation,
      sourceImageUrl,
      sourceVideoUrl,
      resultUrl,
      fileName,
    } = await request.json();

    if (!sourceImageUrl || !sourceVideoUrl || !resultUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save video generation to database
    const videoGeneration = await prisma.videoGeneration.create({
      data: {
        userId: session.user.id,
        prompt: prompt || null,
        characterOrientation: characterOrientation || "image",
        sourceImageUrl,
        sourceVideoUrl,
        resultUrl,
        fileName: fileName || null,
      },
    });

    return NextResponse.json({
      success: true,
      generation: videoGeneration,
    });
  } catch (error) {
    console.error("Video save error:", error);
    return NextResponse.json(
      { error: "Failed to save video" },
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

    // Get user's video generations
    const generations = await prisma.videoGeneration.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ generations });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing video ID" }, { status: 400 });
    }

    // Verify ownership and delete
    const video = await prisma.videoGeneration.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    await prisma.videoGeneration.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
