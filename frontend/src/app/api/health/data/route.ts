import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { glucoseReading, moodEntry, mealEntry } from "@/lib/db/schema";
import { eq, desc, gte } from "drizzle-orm";
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
    const days = parseInt(searchParams.get("days") || "7");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch glucose readings
    const glucoseReadings = await db
      .select()
      .from(glucoseReading)
      .where(eq(glucoseReading.userId, session.user.id))
      .orderBy(desc(glucoseReading.timestamp))
      .limit(100);

    // Fetch mood entries
    const moodEntries = await db
      .select()
      .from(moodEntry)
      .where(eq(moodEntry.userId, session.user.id))
      .orderBy(desc(moodEntry.date))
      .limit(30);

    // Fetch meal history
    const mealHistory = await db
      .select()
      .from(mealEntry)
      .where(eq(mealEntry.userId, session.user.id))
      .orderBy(desc(mealEntry.date))
      .limit(50);

    // Transform data to match frontend expectations
    const transformedGlucoseReadings = glucoseReadings.map(reading => ({
      timestamp: reading.timestamp.toISOString(),
      value: reading.value,
      status: reading.status
    }));

    const transformedMoodEntries = moodEntries.map(entry => ({
      date: entry.date.toISOString().split('T')[0],
      mood: entry.mood,
      energy: entry.energy,
      stress: entry.stress,
      notes: entry.notes
    }));

    const transformedMealHistory = mealHistory.map(meal => ({
      id: meal.id,
      date: meal.date.toISOString().split('T')[0],
      type: meal.type,
      name: meal.name,
      calories: meal.calories,
      carbs: meal.carbs,
      protein: meal.protein,
      fat: meal.fat,
      fiber: meal.fiber,
      glycemicImpact: meal.glycemicImpact
    }));

    return NextResponse.json({
      glucoseReadings: transformedGlucoseReadings,
      moodEntries: transformedMoodEntries,
      mealHistory: transformedMealHistory
    });
  } catch (error) {
    console.error("Error fetching health data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}