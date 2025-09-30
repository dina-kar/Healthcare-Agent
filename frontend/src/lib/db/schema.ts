import { pgTable, text, timestamp, boolean, integer, real, varchar } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  city: text("city"),
  dietaryPreference: varchar("dietary_preference", { length: 50 }),
  medicalConditions: text("medical_conditions"),
  physicalLimitations: text("physical_limitations"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Health data tables
export const glucoseReading = pgTable("glucose_reading", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  value: real("value").notNull(),
  status: varchar("status", { length: 10 }).notNull(), // 'normal', 'high', 'low'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const moodEntry = pgTable("mood_entry", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  mood: varchar("mood", { length: 20 }).notNull(), // 'great', 'good', 'okay', 'poor', 'terrible'
  energy: integer("energy").notNull(), // 1-10
  stress: integer("stress").notNull(), // 1-10
  notes: text("notes"),
  date: timestamp("date").notNull().defaultNow(),
});

export const mealEntry = pgTable("meal_entry", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // 'breakfast', 'lunch', 'dinner', 'snack'
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  carbs: real("carbs").notNull(),
  protein: real("protein").notNull(),
  fat: real("fat").notNull(),
  fiber: real("fiber").notNull(),
  glycemicImpact: varchar("glycemic_impact", { length: 10 }).notNull(), // 'low', 'medium', 'high'
  date: timestamp("date").notNull().defaultNow(),
});

export const userSession = pgTable("user_session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  mood: varchar("mood", { length: 20 }),
  cgmReading: real("cgm_reading"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const foodLog = pgTable("food_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  mealDescription: text("meal_description").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});
