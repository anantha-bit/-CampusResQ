import { NextResponse } from "next/server";
import pool from "@/lib/db";

// =====================================================
// GET - Fetch all emergencies
// =====================================================
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        e.emergency_id,
        e.reported_by,
        e.location_id,
        e.emergency_type,
        e.priority,
        e.description,
        e.status,
        e.created_at,
        l.building,
        l.floor,
        l.room
      FROM emergencies e
      JOIN locations l
        ON e.location_id = l.location_id
      ORDER BY e.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      emergencies: rows,
    });
  } catch (error) {
    console.error("GET emergencies error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch emergencies",
      },
      { status: 500 }
    );
  }
}


// =====================================================
// POST - Create a new emergency
// =====================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      reported_by,
      location_id,
      emergency_type,
      priority,
      description,
    } = body;

    if (
      !reported_by ||
      !location_id ||
      !emergency_type ||
      !priority ||
      !description
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `
      INSERT INTO emergencies
      (
        reported_by,
        location_id,
        emergency_type,
        priority,
        description,
        status
      )
      VALUES (?, ?, ?, ?, ?, 'ACTIVE')
      `,
      [
        reported_by,
        location_id,
        emergency_type,
        priority,
        description,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Emergency reported successfully",
      result,
    });
  } catch (error) {
    console.error("POST emergencies error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to report emergency",
      },
      { status: 500 }
    );
  }
}


// =====================================================
// PATCH - Update emergency status
// =====================================================
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { emergency_id, status } = body;

    console.log("PATCH request:", {
      emergency_id,
      status,
    });

    // Check emergency ID
    if (!emergency_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Emergency ID is required",
        },
        { status: 400 }
      );
    }

    // Check status
    if (!status) {
      return NextResponse.json(
        {
          success: false,
          message: "Status is required",
        },
        { status: 400 }
      );
    }

    // Only allow these statuses
    const allowedStatuses = [
      "ACTIVE",
      "IN_PROGRESS",
      "RESOLVED",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid emergency status",
        },
        { status: 400 }
      );
    }

    // Update database
    const [result] = await pool.query(
      `
      UPDATE emergencies
      SET status = ?
      WHERE emergency_id = ?
      `,
      [status, emergency_id]
    );

    console.log("UPDATE result:", result);

    return NextResponse.json({
      success: true,
      message: "Emergency status updated successfully",
      emergency_id,
      status,
    });
  } catch (error) {
    console.error("PATCH emergencies error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update emergency status",
      },
      { status: 500 }
    );
  }
}