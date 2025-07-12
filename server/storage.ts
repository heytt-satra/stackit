import {
  users,
  questions,
  answers,
  tags,
  questionTags,
  questionVotes,
  answerVotes,
  type User,
  type UpsertUser,
  type Question,
  type InsertQuestion,
  type Answer,
  type InsertAnswer,
  type Tag,
  type InsertTag,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Question operations
  getQuestions(offset?: number, limit?: number, filter?: string): Promise<any[]>;
  getQuestionById(id: number): Promise<any | undefined>;
  createQuestion(question: InsertQuestion, tagNames: string[]): Promise<Question>;
  voteQuestion(questionId: number, userId: string, voteType: number): Promise<void>;
  
  // Answer operations
  getAnswersByQuestionId(questionId: number): Promise<any[]>;
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  voteAnswer(answerId: number, userId: string, voteType: number): Promise<void>;
  acceptAnswer(answerId: number): Promise<void>;
  
  // Tag operations
  getTags(): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  getOrCreateTags(tagNames: string[]): Promise<Tag[]>;
  
  // Search operations
  searchQuestions(query: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Question operations
  async getQuestions(offset = 0, limit = 20, filter = "newest"): Promise<any[]> {
    try {
      console.log("getQuestions called with:", { offset, limit, filter });
      
      let orderBy;
      switch (filter) {
        case "unanswered":
          orderBy = desc(questions.createdAt);
          break;
        case "newest":
        default:
          orderBy = desc(questions.createdAt);
          break;
      }

      console.log("Executing database query...");
      
      const result = await db
        .select({
          question: questions,
          author: users,
          voteCount: sql<number>`COALESCE(SUM(${questionVotes.voteType}), 0)`,
          answerCount: sql<number>`COUNT(DISTINCT ${answers.id})`,
          tags: sql<string>`STRING_AGG(${tags.name}, ',')`,
        })
        .from(questions)
        .leftJoin(users, eq(questions.authorId, users.id))
        .leftJoin(questionVotes, eq(questions.id, questionVotes.questionId))
        .leftJoin(answers, eq(questions.id, answers.questionId))
        .leftJoin(questionTags, eq(questions.id, questionTags.questionId))
        .leftJoin(tags, eq(questionTags.tagId, tags.id))
        .groupBy(questions.id, users.id)
        .orderBy(orderBy)
        .offset(offset)
        .limit(limit);

      console.log("Database query completed, raw result length:", result.length);
      
      const mappedResult = result.map(row => ({
        ...row.question,
        author: row.author,
        voteCount: row.voteCount,
        answerCount: row.answerCount,
        tags: row.tags ? row.tags.split(',').filter(Boolean) : [],
      }));
      
      console.log("Mapped result length:", mappedResult.length);
      console.log("Sample mapped question:", mappedResult[0]);
      
      return mappedResult;
    } catch (error) {
      console.error("Error in getQuestions:", error);
      throw error;
    }
  }

  async getQuestionById(id: number): Promise<any | undefined> {
    const result = await db
      .select({
        question: questions,
        author: users,
        voteCount: sql<number>`COALESCE(SUM(${questionVotes.voteType}), 0)`,
        answerCount: sql<number>`COUNT(DISTINCT ${answers.id})`,
        tags: sql<string>`STRING_AGG(${tags.name}, ',')`,
      })
      .from(questions)
      .leftJoin(users, eq(questions.authorId, users.id))
      .leftJoin(questionVotes, eq(questions.id, questionVotes.questionId))
      .leftJoin(answers, eq(questions.id, answers.questionId))
      .leftJoin(questionTags, eq(questions.id, questionTags.questionId))
      .leftJoin(tags, eq(questionTags.tagId, tags.id))
      .where(eq(questions.id, id))
      .groupBy(questions.id, users.id);

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.question,
      author: row.author,
      voteCount: row.voteCount,
      answerCount: row.answerCount,
      tags: row.tags ? row.tags.split(',').filter(Boolean) : [],
    };
  }

  async createQuestion(question: InsertQuestion, tagNames: string[]): Promise<Question> {
    try {
      console.log("Creating question with data:", question);
      console.log("Tag names:", tagNames);
      
      const [newQuestion] = await db.insert(questions).values(question).returning();
      console.log("Created question:", newQuestion);
      
      if (tagNames.length > 0) {
        console.log("Creating tags...");
        const createdTags = await this.getOrCreateTags(tagNames);
        console.log("Created tags:", createdTags);
        
        await db.insert(questionTags).values(
          createdTags.map(tag => ({
            questionId: newQuestion.id,
            tagId: tag.id,
          }))
        );
        console.log("Linked tags to question");
      }
      
      return newQuestion;
    } catch (error) {
      console.error("Error in createQuestion:", error);
      throw error;
    }
  }

  async voteQuestion(questionId: number, userId: string, voteType: number): Promise<void> {
    await db
      .insert(questionVotes)
      .values({ questionId, userId, voteType })
      .onConflictDoUpdate({
        target: [questionVotes.questionId, questionVotes.userId],
        set: { voteType },
      });
  }

  // Answer operations
  async getAnswersByQuestionId(questionId: number): Promise<any[]> {
    const result = await db
      .select({
        answer: answers,
        author: users,
        voteCount: sql<number>`COALESCE(SUM(${answerVotes.voteType}), 0)`,
      })
      .from(answers)
      .leftJoin(users, eq(answers.authorId, users.id))
      .leftJoin(answerVotes, eq(answers.id, answerVotes.answerId))
      .where(eq(answers.questionId, questionId))
      .groupBy(answers.id, users.id)
      .orderBy(desc(answers.isAccepted), desc(answers.createdAt));

    return result.map(row => ({
      ...row.answer,
      author: row.author,
      voteCount: row.voteCount,
    }));
  }

  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const [newAnswer] = await db.insert(answers).values(answer).returning();
    return newAnswer;
  }

  async voteAnswer(answerId: number, userId: string, voteType: number): Promise<void> {
    await db
      .insert(answerVotes)
      .values({ answerId, userId, voteType })
      .onConflictDoUpdate({
        target: [answerVotes.answerId, answerVotes.userId],
        set: { voteType },
      });
  }

  async acceptAnswer(answerId: number): Promise<void> {
    const [answer] = await db.select().from(answers).where(eq(answers.id, answerId));
    if (!answer) return;

    // Unaccept all other answers for this question
    await db
      .update(answers)
      .set({ isAccepted: false })
      .where(eq(answers.questionId, answer.questionId));

    // Accept this answer
    await db
      .update(answers)
      .set({ isAccepted: true })
      .where(eq(answers.id, answerId));
  }

  // Tag operations
  async getTags(): Promise<Tag[]> {
    return await db.select().from(tags).orderBy(tags.name);
  }

  async createTag(tag: InsertTag): Promise<Tag> {
    const [newTag] = await db.insert(tags).values(tag).returning();
    return newTag;
  }

  async getOrCreateTags(tagNames: string[]): Promise<Tag[]> {
    const existingTags = await db
      .select()
      .from(tags)
      .where(inArray(tags.name, tagNames));

    const existingTagNames = existingTags.map(tag => tag.name);
    const newTagNames = tagNames.filter(name => !existingTagNames.includes(name));

    if (newTagNames.length > 0) {
      const newTags = await db
        .insert(tags)
        .values(newTagNames.map(name => ({ name })))
        .returning();
      return [...existingTags, ...newTags];
    }

    return existingTags;
  }

  // Search operations
  async searchQuestions(query: string): Promise<any[]> {
    const result = await db
      .select({
        question: questions,
        author: users,
        voteCount: sql<number>`COALESCE(SUM(${questionVotes.voteType}), 0)`,
        answerCount: sql<number>`COUNT(DISTINCT ${answers.id})`,
        tags: sql<string>`STRING_AGG(${tags.name}, ',')`,
      })
      .from(questions)
      .leftJoin(users, eq(questions.authorId, users.id))
      .leftJoin(questionVotes, eq(questions.id, questionVotes.questionId))
      .leftJoin(answers, eq(questions.id, answers.questionId))
      .leftJoin(questionTags, eq(questions.id, questionTags.questionId))
      .leftJoin(tags, eq(questionTags.tagId, tags.id))
      .where(
        sql`${questions.title} ILIKE ${`%${query}%`} OR ${questions.content} ILIKE ${`%${query}%`}`
      )
      .groupBy(questions.id, users.id)
      .orderBy(desc(questions.createdAt));

    return result.map(row => ({
      ...row.question,
      author: row.author,
      voteCount: row.voteCount,
      answerCount: row.answerCount,
      tags: row.tags ? row.tags.split(',').filter(Boolean) : [],
    }));
  }
}

export const storage = new DatabaseStorage();
