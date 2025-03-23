import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Question table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  language: text("language").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  views: integer("views").default(0),
});

// Answer table
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  sources: jsonb("sources").notNull(),
  questionId: integer("question_id").notNull().references(() => questions.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feedback table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  answerId: integer("answer_id").references(() => answers.id),
  type: text("type").notNull(), // 'positive', 'negative', or 'report'
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// API Key table
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  service: text("service").notNull(), // 'openai', 'pinecone', etc.
  key: text("key").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used"),
  usageCount: integer("usage_count").default(0),
});

// Document table for RAG
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'fiqh', 'aqidah', 'family', etc.
  sources: jsonb("sources").notNull(),
  vectorId: text("vector_id"), // ID in the vector database
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  text: true,
  language: true,
  userId: true,
});

export const insertAnswerSchema = createInsertSchema(answers).pick({
  text: true,
  sources: true,
  questionId: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  answerId: true,
  type: true,
  comment: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  service: true,
  key: true,
  isActive: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  content: true,
  type: true,
  sources: true,
  vectorId: true,
  isActive: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type Answer = typeof answers.$inferSelect;

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
