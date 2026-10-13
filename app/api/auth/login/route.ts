import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate the login input
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    // Find the user and their role in MySQL
    const [rows] = await pool.execute(
      `SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.email = ?
       LIMIT 1`,
      [email.trim()]
    );

    const users = rows as Array<{
      user_id: number;
      name: string;
      email: string;
      password_hash: string;
      role_name: string;
    }>;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const user = users[0];

    // Compare the submitted password with its stored bcrypt hash
    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Require a secret configured in .env.local
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
      console.error("JWT_SECRET is missing or too short.");

      return NextResponse.json(
        { success: false, message: "Authentication is not configured." },
        { status: 500 }
      );
    }

    // Create a signed token
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.role_name,
      },
      secret,
      { expiresIn: "2h" }
    );

    // Store the token in an HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role_name,
      },
    });

    response.cookies.set("campusresq_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 2 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to process login." },
      { status: 500 }
    );
  }
}