import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { moodEntry } from "@/lib/db/schema";
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
    const limit = parseInt(searchParams.get("limit") || "30");

    const entries = await db
      .select()
      .from(moodEntry)
      .where(eq(moodEntry.userId, session.user.id))
      .orderBy(desc(moodEntry.date))
      .limit(limit);

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching mood entries:", error);
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
    const { mood, energy, stress, notes } = body;

    if (!mood || energy === undefined || stress === undefined) {
      return NextResponse.json(
        { error: "Mood, energy, and stress are required" },
        { status: 400 }
      );
    }

    const newEntry = await db
      .insert(moodEntry)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        mood,
        energy,
        stress,
        notes,
        date: new Date(),
      })
      .returning();

    return NextResponse.json(newEntry[0]);
  } catch (error) {
    console.error("Error creating mood entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}