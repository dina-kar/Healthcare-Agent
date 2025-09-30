import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const [row] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, userId))
    .limit(1);

  if (!row) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Only return fields the settings page needs
  const data = {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
    city: row.city ?? "",
    dietaryPreference: row.dietaryPreference ?? "",
    medicalConditions: row.medicalConditions ?? "",
    physicalLimitations: row.physicalLimitations ?? "",
  };

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();

  const updateData: Partial<typeof schema.user["$inferInsert"]> = {};
  if (typeof body.name === "string") updateData.name = body.name.trim();
  if (typeof body.city === "string") updateData.city = body.city.trim();
  if (typeof body.dietaryPreference === "string") updateData.dietaryPreference = body.dietaryPreference.trim();
  if (typeof body.medicalConditions === "string") updateData.medicalConditions = body.medicalConditions.trim();
  if (typeof body.physicalLimitations === "string") updateData.physicalLimitations = body.physicalLimitations.trim();

  if (Object.keys(updateData).length === 0) {
    return new NextResponse("No valid fields to update", { status: 400 });
  }

  await db
    .update(schema.user)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(schema.user.id, userId));

  return new NextResponse(null, { status: 204 });
}
