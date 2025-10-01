/*
  Seed script for demo data
  - Creates 3 users via Better Auth email+password (handles hashing)
  - Updates profile fields (city, dietaryPreference, etc.)
  - Inserts glucose readings, mood entries, meal entries, sessions, and food logs
*/

import 'dotenv/config';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../src/lib/db';
import * as schema from '../src/lib/db/schema';
import { auth } from '../src/lib/auth';
import { randomUUID } from 'crypto';

type SeedUser = {
  name: string;
  email: string;
  password: string;
  city?: string | null;
  dietaryPreference?: string | null;
  medicalConditions?: string | null;
  physicalLimitations?: string | null;
};

const users: SeedUser[] = [
  {
    name: 'Alice Runner',
    email: 'alice@example.com',
    password: 'Demo1234!',
    city: 'San Francisco',
    dietaryPreference: 'vegetarian',
    medicalConditions: 'pre-diabetes',
    physicalLimitations: 'none',
  },
  {
    name: 'Bob Lifter',
    email: 'bob@example.com',
    password: 'Demo1234!',
    city: 'Austin',
    dietaryPreference: 'high-protein',
    medicalConditions: 'type-2 diabetes',
    physicalLimitations: 'knee pain',
  },
  {
    name: 'Charlie Walker',
    email: 'charlie@example.com',
    password: 'Demo1234!',
    city: 'Seattle',
    dietaryPreference: 'balanced',
    medicalConditions: 'none',
    physicalLimitations: 'ankle sprain (recovering)',
  },
];

const uid = () => randomUUID();

async function ensureUser(u: SeedUser) {
  // Check if user already exists
  const existing = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(eq(schema.user.email, u.email))
    .limit(1);

  let userId: string;

  if (existing.length) {
    userId = existing[0].id;
  } else {
    // Use Better Auth to create (handles password hashing + account row)
    try {
      const response = await auth.api.signUpEmail({
        body: {
          email: u.email,
          password: u.password,
          name: u.name,
        },
        asResponse: true,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.warn(`Signup warning for ${u.email}:`, errorData);
      }
    } catch (err: any) {
      // If signup raced with another process, fall back to lookup
      console.warn(`Signup warning for ${u.email}:`, err?.message ?? err);
    }
    const created = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.email, u.email))
      .limit(1);
    if (!created.length) {
      throw new Error(`Failed to create or find user for ${u.email}`);
    }
    userId = created[0].id;
  }

  // Update profile fields
  await db
    .update(schema.user)
    .set({
      city: u.city ?? null,
      dietaryPreference: u.dietaryPreference ?? null,
      medicalConditions: u.medicalConditions ?? null,
      physicalLimitations: u.physicalLimitations ?? null,
      updatedAt: new Date(),
    })
    .where(eq(schema.user.id, userId));

  return userId;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function seedHealthData(userId: string, variant: 'a' | 'b' | 'c') {
  // Clear old demo data for idempotency (optional)
  // Only remove recent demo data (last 30 days) to avoid nuking real data
  const cutoff = daysAgo(30);
  await db.delete(schema.glucoseReading).where(and(eq(schema.glucoseReading.userId, userId), sql`${schema.glucoseReading.timestamp} >= ${cutoff}`));
  await db.delete(schema.moodEntry).where(and(eq(schema.moodEntry.userId, userId), sql`${schema.moodEntry.date} >= ${cutoff}`));
  await db.delete(schema.mealEntry).where(and(eq(schema.mealEntry.userId, userId), sql`${schema.mealEntry.date} >= ${cutoff}`));
  await db.delete(schema.userSession).where(and(eq(schema.userSession.userId, userId), sql`${schema.userSession.timestamp} >= ${cutoff}`));
  await db.delete(schema.foodLog).where(and(eq(schema.foodLog.userId, userId), sql`${schema.foodLog.timestamp} >= ${cutoff}`));

  // Glucose patterns per variant
  const glucoseSets: { value: number; status: 'low' | 'normal' | 'high'; offsetDays: number; hour: number }[] =
    variant === 'a'
      ? [
          { value: 85, status: 'normal', offsetDays: 0, hour: 8 },
          { value: 110, status: 'normal', offsetDays: 0, hour: 13 },
          { value: 95, status: 'normal', offsetDays: 0, hour: 20 },
          { value: 120, status: 'high', offsetDays: 1, hour: 13 },
          { value: 78, status: 'low', offsetDays: 2, hour: 7 },
        ]
      : variant === 'b'
      ? [
          { value: 140, status: 'high', offsetDays: 0, hour: 9 },
          { value: 160, status: 'high', offsetDays: 0, hour: 14 },
          { value: 150, status: 'high', offsetDays: 0, hour: 19 },
          { value: 130, status: 'high', offsetDays: 1, hour: 12 },
          { value: 115, status: 'normal', offsetDays: 2, hour: 8 },
        ]
      : [
          { value: 90, status: 'normal', offsetDays: 0, hour: 7 },
          { value: 100, status: 'normal', offsetDays: 0, hour: 12 },
          { value: 88, status: 'normal', offsetDays: 0, hour: 18 },
          { value: 82, status: 'normal', offsetDays: 1, hour: 8 },
          { value: 95, status: 'normal', offsetDays: 2, hour: 20 },
        ];

  await db.insert(schema.glucoseReading).values(
    glucoseSets.map((g) => ({
      id: uid(),
      userId,
      value: g.value,
      status: g.status,
      timestamp: (() => {
        const d = daysAgo(g.offsetDays);
        d.setHours(g.hour, 0, 0, 0);
        return d;
      })(),
    }))
  );

  // Mood entries
  const moodMap =
    variant === 'a'
      ? [
          { mood: 'good', energy: 7, stress: 3, notes: 'Felt productive', offsetDays: 0 },
          { mood: 'great', energy: 8, stress: 2, notes: 'Morning run helped', offsetDays: 1 },
        ]
      : variant === 'b'
      ? [
          { mood: 'okay', energy: 5, stress: 6, notes: 'Busy workday', offsetDays: 0 },
          { mood: 'poor', energy: 4, stress: 7, notes: 'Didn\'t sleep well', offsetDays: 1 },
        ]
      : [
          { mood: 'good', energy: 6, stress: 4, notes: 'Nice walk outside', offsetDays: 0 },
          { mood: 'good', energy: 6, stress: 3, notes: 'Steady day', offsetDays: 2 },
        ];

  await db.insert(schema.moodEntry).values(
    moodMap.map((m) => ({
      id: uid(),
      userId,
      mood: m.mood as any,
      energy: m.energy,
      stress: m.stress,
      notes: m.notes,
      date: daysAgo(m.offsetDays),
    }))
  );

  // Meals
  const meals =
    variant === 'a'
      ? [
          { type: 'breakfast', name: 'Oatmeal with berries', calories: 320, carbs: 50, protein: 10, fat: 6, fiber: 8, glycemicImpact: 'low', offsetDays: 0 },
          { type: 'lunch', name: 'Quinoa salad', calories: 450, carbs: 55, protein: 18, fat: 12, fiber: 9, glycemicImpact: 'medium', offsetDays: 0 },
          { type: 'dinner', name: 'Tofu stir-fry', calories: 520, carbs: 60, protein: 22, fat: 14, fiber: 7, glycemicImpact: 'medium', offsetDays: 0 },
        ]
      : variant === 'b'
      ? [
          { type: 'breakfast', name: 'Pancakes with syrup', calories: 600, carbs: 90, protein: 10, fat: 18, fiber: 2, glycemicImpact: 'high', offsetDays: 0 },
          { type: 'lunch', name: 'Burger and fries', calories: 900, carbs: 80, protein: 30, fat: 45, fiber: 5, glycemicImpact: 'high', offsetDays: 0 },
          { type: 'dinner', name: 'Steak with potatoes', calories: 750, carbs: 50, protein: 40, fat: 35, fiber: 4, glycemicImpact: 'medium', offsetDays: 0 },
        ]
      : [
          { type: 'breakfast', name: 'Greek yogurt + nuts', calories: 350, carbs: 25, protein: 22, fat: 18, fiber: 2, glycemicImpact: 'low', offsetDays: 0 },
          { type: 'lunch', name: 'Chicken salad', calories: 480, carbs: 35, protein: 30, fat: 18, fiber: 6, glycemicImpact: 'low', offsetDays: 0 },
          { type: 'dinner', name: 'Salmon + veggies', calories: 600, carbs: 30, protein: 35, fat: 28, fiber: 8, glycemicImpact: 'low', offsetDays: 0 },
        ];

  await db.insert(schema.mealEntry).values(
    meals.map((m) => ({
      id: uid(),
      userId,
      type: m.type as any,
      name: m.name,
      calories: m.calories,
      carbs: m.carbs,
      protein: m.protein,
      fat: m.fat,
      fiber: m.fiber,
      glycemicImpact: m.glycemicImpact as any,
      date: daysAgo(m.offsetDays),
    }))
  );

  // Sessions
  await db.insert(schema.userSession).values([
    { id: uid(), userId, mood: (moodMap[0]?.mood ?? 'okay') as any, cgmReading: glucoseSets[0]?.value, timestamp: daysAgo(0) },
    { id: uid(), userId, mood: (moodMap[1]?.mood ?? 'good') as any, cgmReading: glucoseSets[1]?.value, timestamp: daysAgo(1) },
  ]);

  // Food logs
  await db.insert(schema.foodLog).values([
    { id: uid(), userId, mealDescription: meals[0]?.name ?? 'Breakfast', timestamp: daysAgo(0) },
    { id: uid(), userId, mealDescription: meals[1]?.name ?? 'Lunch', timestamp: daysAgo(0) },
  ]);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  console.log('Seeding database...');

  const [u1, u2, u3] = users;
  const id1 = await ensureUser(u1);
  const id2 = await ensureUser(u2);
  const id3 = await ensureUser(u3);

  await seedHealthData(id1, 'a');
  await seedHealthData(id2, 'b');
  await seedHealthData(id3, 'c');

  console.log('Seed complete. Login with:');
  users.forEach((u) => {
    console.log(`- ${u.name}: ${u.email} / ${u.password}`);
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Let pg pool drain on process exit; drizzle doesn't need explicit close here in this setup.
  });
