import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthUser {
  userId: number;
  email: string;
  role: "USER" | "RESPONDER" | "ADMIN";
}

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyToken(
  request: NextRequest
): AuthUser | null {
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    return null;
  }

  const token = request.cookies.get("campusresq_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "number" ||
      typeof decoded.email !== "string" ||
      !["USER", "RESPONDER", "ADMIN"].includes(decoded.role as string)
    ) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role as AuthUser["role"],
    };
  } catch {
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      message: "Please log in to access this resource.",
    },
    { status: 401 }
  );
}

export function forbiddenResponse() {
  return NextResponse.json(
    {
      success: false,
      message: "You do not have permission to access this resource.",
    },
    { status: 403 }
  );
}