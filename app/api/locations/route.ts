import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
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
        message: "Failed to fetch locations",
      },
      { status: 500 }
    );
  }
}