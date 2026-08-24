import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET - Fetch all resources
export async function GET() {
  try {
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
        message: "Failed to fetch resources",
      },
      { status: 500 }
    );
  }
}

// POST - Add a resource
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      resource_name,
      resource_type,
      quantity,
    } = body;

    if (
      !resource_name ||
      !resource_type ||
      quantity === undefined ||
      quantity === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    if (Number(quantity) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity cannot be negative",
        },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `
      INSERT INTO resources
      (
        resource_name,
        resource_type,
        quantity
      )
      VALUES (?, ?, ?)
      `,
      [
        resource_name,
        resource_type,
        Number(quantity),
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Resource added successfully",
      result,
    });
  } catch (error) {
    console.error("POST resources error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add resource",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update a resource
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const {
      resource_id,
      resource_name,
      resource_type,
      quantity,
    } = body;

    if (!resource_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Resource ID is required",
        },
        { status: 400 }
      );
    }

    if (
      !resource_name ||
      !resource_type ||
      quantity === undefined ||
      quantity === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    if (Number(quantity) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity cannot be negative",
        },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `
      UPDATE resources
      SET
        resource_name = ?,
        resource_type = ?,
        quantity = ?
      WHERE resource_id = ?
      `,
      [
        resource_name,
        resource_type,
        Number(quantity),
        resource_id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Resource updated successfully",
      result,
    });
  } catch (error) {
    console.error("PATCH resources error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update resource",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a resource
export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const { resource_id } = body;

    if (!resource_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Resource ID is required",
        },
        { status: 400 }
      );
    }

    await pool.query(
      `
      DELETE FROM resources
      WHERE resource_id = ?
      `,
      [resource_id]
    );

    return NextResponse.json({
      success: true,
      message: "Resource deleted successfully",
      resource_id,
    });
  } catch (error) {
    console.error("DELETE resources error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete resource",
      },
      { status: 500 }
    );
  }
}