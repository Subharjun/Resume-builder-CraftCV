import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, full_name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("craftcv");
    const users = db.collection("users");

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const result = await users.insertOne({
      email,
      password: hashedPassword,
      full_name: full_name || "",
      created_at: new Date(),
    });

    // Generate token and set cookie
    const token = generateToken(result.insertedId.toString());
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: result.insertedId.toString(),
        email,
        full_name,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
