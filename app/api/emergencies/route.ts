import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import clientPromise from "@/lib/mongodb";
import {
  verifyToken,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/auth";

export const runtime = "nodejs";

const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const VALID_STATUSES = [
  "ACTIVE",
  "IN_PROGRESS",
  "RESOLVED",
  "CANCELLED",
];

// ============================================================
// GET: Retrieve emergency reports from MySQL
// ============================================================

export async function GET(request: NextRequest) {
  const user = verifyToken(request);

  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const [rows]: any = await pool.query(`
      SELECT
        e.emergency_id,
        e.reported_by,
        e.location_id,
        e.emergency_type,
        e.priority,
        e.description,
        e.status,
        e.created_at,
        e.updated_at,
        l.building,
        l.floor,
        l.room
      FROM emergencies e
      INNER JOIN locations l
        ON e.location_id = l.location_id
      ORDER BY e.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Failed to retrieve emergencies:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve emergency reports.",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST: Create an emergency in MySQL and log it in MongoDB
// ============================================================

export async function POST(request: NextRequest) {
  const user = verifyToken(request);

  if (!user) {
    return unauthorizedResponse();
  }

  let connection: any = null;
  let transactionStarted = false;

  try {
    const body = await request.json();

    const emergency_type =
      typeof body.emergency_type === "string"
        ? body.emergency_type.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const location_id = Number(body.location_id);
    const priority = body.priority;

    // Validate emergency details.
    if (
      !emergency_type ||
      emergency_type.length > 50 ||
      !description ||
      !Number.isSafeInteger(location_id) ||
      location_id <= 0 ||
      typeof priority !== "string" ||
      !VALID_PRIORITIES.includes(priority)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide valid emergency details.",
        },
        { status: 400 }
      );
    }

    // Confirm that the campus location exists.
    const [locations]: any = await pool.query(
      `SELECT location_id, building, floor, room
       FROM locations
       WHERE location_id = ?`,
      [location_id]
    );

    if (locations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected location does not exist.",
        },
        { status: 400 }
      );
    }

    const selectedLocation = locations[0];

    // MySQL is the primary database.
    connection = await pool.getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    const [result]: any = await connection.query(
      `INSERT INTO emergencies
       (
         reported_by,
         location_id,
         emergency_type,
         priority,
         description,
         status
       )
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [
        user.userId,
        location_id,
        emergency_type,
        priority,
        description,
      ]
    );

    const emergencyId = Number(result.insertId);

    await connection.commit();
    transactionStarted = false;

    // Attempt to create the corresponding MongoDB document.
    let mongoLogCreated = false;
    let mongoMessage = "";

    try {
      const client = await clientPromise;
      const db = client.db("campusresq");

      await db.collection("incident_reports").updateOne(
        { emergency_id: emergencyId },
        {
          $setOnInsert: {
            emergency_id: emergencyId,
            reported_by: user.userId,
            emergency_type,
            description,
            location: {
              building: selectedLocation.building,
              floor: selectedLocation.floor,
              room: selectedLocation.room,
            },
            witnesses: [],
            symptoms: [],
            status: "ACTIVE",
            reported_at: new Date(),
          },
        },
        { upsert: true }
      );

      mongoLogCreated = true;
      mongoMessage = "Incident log is available in MongoDB.";
    } catch (mongoError) {
      console.error(
        `MongoDB logging failed for emergency ${emergencyId}:`,
        mongoError
      );

      mongoMessage =
        "Emergency was saved in MySQL, but MongoDB logging failed.";
    }

    return NextResponse.json(
      {
        success: true,
        message: mongoLogCreated
          ? "Emergency reported successfully in both databases."
          : "Emergency saved in MySQL; MongoDB logging needs attention.",
        emergency_id: emergencyId,
        mysqlSaved: true,
        mongoLogCreated,
        mongoMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Transaction rollback failed:", rollbackError);
      }
    }

    console.error("Failed to create emergency:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create the emergency report.",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// ============================================================
// PATCH: Update emergency status in MySQL and MongoDB
// ============================================================

export async function PATCH(request: NextRequest) {
  const user = verifyToken(request);

  if (!user) {
    return unauthorizedResponse();
  }

  // Only responders and administrators can update statuses.
  if (!["RESPONDER", "ADMIN"].includes(user.role)) {
    return forbiddenResponse();
  }

  try {
    const body = await request.json();

    const emergency_id = Number(body.emergency_id);
    const status = body.status;

    if (
      !Number.isSafeInteger(emergency_id) ||
      emergency_id <= 0 ||
      typeof status !== "string" ||
      !VALID_STATUSES.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid emergency ID or status.",
        },
        { status: 400 }
      );
    }

    // Check existence before updating.
    const [existing]: any = await pool.query(
      `SELECT emergency_id
       FROM emergencies
       WHERE emergency_id = ?`,
      [emergency_id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Emergency report not found.",
        },
        { status: 404 }
      );
    }

    // Update MySQL first.
    await pool.query(
      `UPDATE emergencies
       SET status = ?
       WHERE emergency_id = ?`,
      [status, emergency_id]
    );

    // Synchronize the matching MongoDB document.
    let mongoSynced = false;
    let mongoMessage = "";

    try {
      const client = await clientPromise;
      const db = client.db("campusresq");

      const mongoResult = await db.collection("incident_reports").updateOne(
        { emergency_id },
        {
          $set: {
            status,
            last_status_update: new Date(),
          },
        }
      );

      if (mongoResult.matchedCount > 0) {
        mongoSynced = true;
        mongoMessage =
          "MySQL and MongoDB statuses are synchronized.";
      } else {
        mongoMessage =
          "MySQL was updated, but no matching MongoDB incident document exists.";
      }
    } catch (mongoError) {
      console.error(
        `MongoDB synchronization failed for emergency ${emergency_id}:`,
        mongoError
      );

      mongoMessage =
        "MySQL was updated, but MongoDB synchronization failed.";
    }

    return NextResponse.json({
      success: true,
      message: `Emergency status updated to ${status}.`,
      emergency_id,
      status,
      mysqlUpdated: true,
      mongoSynced,
      mongoMessage,
    });
  } catch (error) {
    console.error("Failed to update emergency status:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update emergency status.",
      },
      { status: 500 }
    );
  }
}