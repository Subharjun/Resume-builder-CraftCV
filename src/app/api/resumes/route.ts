import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getAuthToken, verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("craftcv");
    const resumes = db.collection("resumes");

    const userResumes = await resumes
      .find({ user_id: payload.userId })
      .sort({ updated_at: -1 })
      .toArray();

    return NextResponse.json({ resumes: userResumes });
  } catch (error) {
    console.error("Get resumes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, template, data } = await request.json();

    const client = await clientPromise;
    const db = client.db("craftcv");
    const resumes = db.collection("resumes");

    const result = await resumes.insertOne({
      user_id: payload.userId,
      title: title || "Untitled Resume",
      template: template || "minimalist",
      data: data || {},
      created_at: new Date(),
      updated_at: new Date(),
    });

    return NextResponse.json({
      success: true,
      resume: {
        _id: result.insertedId.toString(),
        title,
        template,
      },
    });
  } catch (error) {
    console.error("Create resume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
