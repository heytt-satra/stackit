import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User storage table for Clerk authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Clerk user ID
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  questionId: integer("question_id").notNull().references(() => questions.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  isAccepted: boolean("is_accepted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questionTags = pgTable("question_tags", {
  questionId: integer("question_id").notNull().references(() => questions.id),
  tagId: integer("tag_id").notNull().references(() => tags.id),
});

export const questionVotes = pgTable("question_votes", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull().references(() => questions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  voteType: integer("vote_type").notNull(), // 1 for upvote, -1 for downvote
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueVote: unique().on(table.questionId, table.userId),
}));

export const answerVotes = pgTable("answer_votes", {
  id: serial("id").primaryKey(),
  answerId: integer("answer_id").notNull().references(() => answers.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  voteType: integer("vote_type").notNull(), // 1 for upvote, -1 for downvote
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueVote: unique().on(table.answerId, table.userId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  questions: many(questions),
  answers: many(answers),
  questionVotes: many(questionVotes),
  answerVotes: many(answerVotes),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  author: one(users, {
    fields: [questions.authorId],
    references: [users.id],
  }),
  answers: many(answers),
  questionTags: many(questionTags),
  votes: many(questionVotes),
}));

export const answersRelations = relations(answers, ({ one, many }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
  author: one(users, {
    fields: [answers.authorId],
    references: [users.id],
  }),
  votes: many(answerVotes),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  questionTags: many(questionTags),
}));

export const questionTagsRelations = relations(questionTags, ({ one }) => ({
  question: one(questions, {
    fields: [questionTags.questionId],
    references: [questions.id],
  }),
  tag: one(tags, {
    fields: [questionTags.tagId],
    references: [tags.id],
  }),
}));

// Insert schemas
export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnswerSchema = createInsertSchema(answers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;
