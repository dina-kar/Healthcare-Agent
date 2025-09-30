import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mealEntry } from "@/lib/db/schema";
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
    const days = parseInt(searchParams.get("days") || "7");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await db
      .select()
      .from(mealEntry)
      .where(eq(mealEntry.userId, session.user.id))
      .orderBy(desc(mealEntry.date))
      .limit(limit);

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching meal entries:", error);
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
    const { type, name, calories, carbs, protein, fat, fiber, glycemicImpact } = body;

    if (!type || !name || calories === undefined) {
      return NextResponse.json(
        { error: "Type, name, and calories are required" },
        { status: 400 }
      );
    }

    const newEntry = await db
      .insert(mealEntry)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        type,
        name,
        calories,
        carbs: carbs || 0,
        protein: protein || 0,
        fat: fat || 0,
        fiber: fiber || 0,
        glycemicImpact: glycemicImpact || 'medium',
        date: new Date(),
      })
      .returning();

    return NextResponse.json(newEntry[0]);
  } catch (error) {
    console.error("Error creating meal entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}