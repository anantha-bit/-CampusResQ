import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

// GET - Fetch all resources for authenticated users
export async function GET(request: NextRequest) {
  // Verify the user's login token
  const user = verifyToken(request);

  if (!user) {
    return unauthorizedResponse();
  }

  try {
    // Fetch resources from MySQL
    const [rows] = await pool.query(`
      SELECT
        resource_id,
        resource_name,
        resource_type,
        quantity
      FROM resources
      ORDER BY resource_id DESC
    `);

    return NextResponse.json({
      success: true,
      resources: rows,
    });
  } catch (error) {
    console.error("GET resources error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch resources.",
      },
      { status: 500 }
    );
  }
}