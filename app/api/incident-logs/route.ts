import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import pool from "@/lib/db";
import { verifyToken, unauthorizedResponse } from "@/lib/auth";

export const runtime = "nodejs";

// GET - Retrieve incident reports from MongoDB
export async function GET(request: NextRequest) {
  // Verify login
  const user = verifyToken(request);

  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const client = await clientPromise;
    const db = client.db("campusresq");

    const incidents = await db
      .collection("incident_reports")
      .find({})
      .sort({ reported_at: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    console.error("Failed to retrieve incident reports:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve incident reports.",
      },
      { status: 500 }
    );
  }
}

// POST - Create an incident log in MongoDB
export async function POST(request: NextRequest) {
  // Verify login
  const user = verifyToken(request);

  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();

    const {
      emergency_id,
      reported_by,
      emergency_type,
      description,
      location,
      witnesses,
      symptoms,
    } = body;

    // Validate required fields
    if (
      !Number.isInteger(Number(emergency_id)) ||
      !Number.isInteger(Number(reported_by)) ||
      typeof emergency_type !== "string" ||
      !emergency_type.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      !location ||
      typeof location.building !== "string" ||
      !location.building.trim() ||
      typeof location.floor !== "string" ||
      !location.floor.trim() ||
      typeof location.room !== "string" ||
      !location.room.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide all required incident details.",
        },
        { status: 400 }
      );
    }

    // Users can only report incidents under their own account.
    // Responders and admins may report on behalf of another user.
    const reporterId = Number(reported_by);

    if (user.role === "USER" && reporterId !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only report an incident under your own account.",
        },
        { status: 403 }
      );
    }

    // Check that the emergency exists in MySQL
    const [emergencyRows] = await pool.execute(
      "SELECT emergency_id FROM emergencies WHERE emergency_id = ?",
      [Number(emergency_id)]
    );

    if ((emergencyRows as Array<{ emergency_id: number }>).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The specified emergency does not exist.",
        },
        { status: 404 }
      );
    }

    // Validate optional arrays
    if (
      witnesses !== undefined &&
      (!Array.isArray(witnesses) ||
        !witnesses.every(
          (witness) =>
            witness &&
            typeof witness.name === "string" &&
            (witness.contact === undefined ||
              typeof witness.contact === "string")
        ))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid witnesses format." },
        { status: 400 }
      );
    }

    if (
      symptoms !== undefined &&
      (!Array.isArray(symptoms) ||
        !symptoms.every((symptom) => typeof symptom === "string"))
    ) {
      return NextResponse.json(
        { success: false, message: "Symptoms must be an array of strings." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("campusresq");

    const incident = {
      emergency_id: Number(emergency_id),
      reported_by: reporterId,
      emergency_type: emergency_type.trim(),
      description: description.trim(),
      location: {
        building: location.building.trim(),
        floor: location.floor.trim(),
        room: location.room.trim(),
      },
      witnesses: witnesses ?? [],
      symptoms: symptoms ?? [],
      status: "ACTIVE",
      reported_at: new Date(),
    };

    const result = await db
      .collection("incident_reports")
      .insertOne(incident);

    return NextResponse.json(
      {
        success: true,
        message: "Incident log created successfully.",
        incident_id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create incident log:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create incident log.",
      },
      { status: 500 }
    );
  }
}