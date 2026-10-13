import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

// GET - Fetch all locations for authenticated users
export async function GET(request: NextRequest) {
  // Verify the login token
  const user = verifyToken(request);

  if (!user) {
    return unauthorizedResponse();
  }

  try {
    // Fetch locations from MySQL
    const [rows] = await pool.query(`
      SELECT
        location_id,
        building,
        floor,
        room
      FROM locations
      ORDER BY location_id ASC
    `);

    return NextResponse.json({
      success: true,
      locations: rows,
    });
  } catch (error) {
    console.error("GET locations error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch locations.",
      },
      { status: 500 }
    );
  }
}