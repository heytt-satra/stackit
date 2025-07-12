import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuestionSchema, insertAnswerSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Question routes
  app.get('/api/questions', async (req, res) => {
    try {
      const { page = '1', limit = '20', filter = 'newest' } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const questions = await storage.getQuestions(
        offset,
        parseInt(limit as string),
        filter as string
      );
      
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.get('/api/questions/:id', async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      if (isNaN(questionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }
      
      const question = await storage.getQuestionById(questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json(question);
    } catch (error) {
      console.error("Error fetching question:", error);
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  app.post('/api/questions', async (req, res) => {
    try {
      const { tags, authorId, ...questionData } = req.body;
      
      if (!authorId) {
        return res.status(400).json({ message: "Author ID is required" });
      }
      
      const validatedData = insertQuestionSchema.parse({
        ...questionData,
        authorId,
      });
      
      const tagNames = Array.isArray(tags) ? tags : 
        typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [];
      
      const question = await storage.createQuestion(validatedData, tagNames);
      res.json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid question data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  app.post('/api/questions/:id/vote', async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const { voteType, userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      if (![1, -1].includes(voteType)) {
        return res.status(400).json({ message: "Invalid vote type" });
      }
      
      await storage.voteQuestion(questionId, userId, voteType);
      res.json({ success: true });
    } catch (error) {
      console.error("Error voting on question:", error);
      res.status(500).json({ message: "Failed to vote on question" });
    }
  });

  // Answer routes
  app.get('/api/questions/:id/answers', async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const answers = await storage.getAnswersByQuestionId(questionId);
      res.json(answers);
    } catch (error) {
      console.error("Error fetching answers:", error);
      res.status(500).json({ message: "Failed to fetch answers" });
    }
  });

  app.post('/api/questions/:id/answers', async (req, res) => {
    try {
      const questionId = parseInt(req.params.id);
      const { content, authorId } = req.body;
      
      if (!authorId) {
        return res.status(400).json({ message: "Author ID is required" });
      }
      
      const validatedData = insertAnswerSchema.parse({
        content,
        questionId,
        authorId,
      });
      
      const answer = await storage.createAnswer(validatedData);
      res.json(answer);
    } catch (error) {
      console.error("Error creating answer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid answer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create answer" });
    }
  });

  app.post('/api/answers/:id/vote', async (req, res) => {
    try {
      const answerId = parseInt(req.params.id);
      const { voteType, userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      if (![1, -1].includes(voteType)) {
        return res.status(400).json({ message: "Invalid vote type" });
      }
      
      await storage.voteAnswer(answerId, userId, voteType);
      res.json({ success: true });
    } catch (error) {
      console.error("Error voting on answer:", error);
      res.status(500).json({ message: "Failed to vote on answer" });
    }
  });

  app.post('/api/answers/:id/accept', async (req, res) => {
    try {
      const answerId = parseInt(req.params.id);
      await storage.acceptAnswer(answerId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error accepting answer:", error);
      res.status(500).json({ message: "Failed to accept answer" });
    }
  });

  // Tag routes
  app.get('/api/tags', async (req, res) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  // Search routes
  app.get('/api/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const questions = await storage.searchQuestions(q);
      res.json(questions);
    } catch (error) {
      console.error("Error searching questions:", error);
      res.status(500).json({ message: "Failed to search questions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
