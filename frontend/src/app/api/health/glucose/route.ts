import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { glucoseReading } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const readings = await db
      .select()
      .from(glucoseReading)
      .where(eq(glucoseReading.userId, session.user.id))
      .orderBy(desc(glucoseReading.timestamp))
      .limit(limit);

    return NextResponse.json(readings);
  } catch (error) {
    console.error("Error fetching glucose readings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { value, status } = body;

    if (!value || !status) {
      return NextResponse.json(
        { error: "Value and status are required" },
        { status: 400 }
      );
    }

    const newReading = await db
      .insert(glucoseReading)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        value,
        status,
        timestamp: new Date(),
      })
      .returning();

    return NextResponse.json(newReading[0]);
  } catch (error) {
    console.error("Error creating glucose reading:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}