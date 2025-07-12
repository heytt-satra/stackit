import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuestionSchema, insertAnswerSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post('/api/users', async (req, res) => {
    try {
      const { id, email, firstName, lastName, profileImageUrl } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const user = await storage.upsertUser({
        id,
        email,
        firstName,
        lastName,
        profileImageUrl,
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error creating/updating user:", error);
      res.status(500).json({ message: "Failed to create/update user" });
    }
  });

  app.get('/api/users/:id/statistics', async (req, res) => {
    try {
      const userId = req.params.id;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const statistics = await storage.getUserStatistics(userId);
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  app.get('/api/users/:id/questions', async (req, res) => {
    try {
      const userId = req.params.id;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const questions = await storage.getUserQuestions(userId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching user questions:", error);
      res.status(500).json({ message: "Failed to fetch user questions" });
    }
  });

  app.get('/api/users/:id/answers', async (req, res) => {
    try {
      const userId = req.params.id;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const answers = await storage.getUserAnswers(userId);
      res.json(answers);
    } catch (error) {
      console.error("Error fetching user answers:", error);
      res.status(500).json({ message: "Failed to fetch user answers" });
    }
  });

  // Question routes
  app.get('/api/questions', async (req, res) => {
    try {
      const { page = '1', limit = '20', filter = 'newest' } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      console.log("Fetching questions with params:", { page, limit, filter, offset });
      
      const questions = await storage.getQuestions(
        offset,
        parseInt(limit as string),
        filter as string
      );
      
      console.log("Retrieved questions:", questions.length);
      console.log("First question sample:", questions[0]);
      
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
      
      console.log("Received question data:", { tags, authorId, ...questionData });
      
      if (!authorId) {
        return res.status(400).json({ message: "Author ID is required" });
      }
      
      // Check if user exists, if not create them
      let user = await storage.getUser(authorId);
      if (!user) {
        console.log("User not found, creating user with ID:", authorId);
        // Create a basic user record - you might want to get more user data from Clerk
        user = await storage.upsertUser({
          id: authorId,
          email: null,
          firstName: null,
          lastName: null,
          profileImageUrl: null,
        });
        console.log("Created user:", user);
      }
      
      const validatedData = insertQuestionSchema.parse({
        ...questionData,
        authorId,
      });
      
      console.log("Validated data:", validatedData);
      
      const tagNames = Array.isArray(tags) ? tags : 
        typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [];
      
      console.log("Tag names:", tagNames);
      
      const question = await storage.createQuestion(validatedData, tagNames);
      console.log("Created question:", question);
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
      
      console.log("Voting on question:", { questionId, voteType, userId });
      
      if (!userId) {
        console.log("Error: User ID is required");
        return res.status(400).json({ message: "User ID is required" });
      }
      
      if (![1, -1].includes(voteType)) {
        console.log("Error: Invalid vote type:", voteType);
        return res.status(400).json({ message: "Invalid vote type" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        console.log("Error: User not found:", userId);
        return res.status(400).json({ message: "User not found" });
      }
      
      console.log("User found, proceeding with vote");
      await storage.voteQuestion(questionId, userId, voteType);
      console.log("Vote recorded successfully");
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
      
      console.log("Voting on answer:", { answerId, voteType, userId });
      
      if (!userId) {
        console.log("Error: User ID is required");
        return res.status(400).json({ message: "User ID is required" });
      }
      
      if (![1, -1].includes(voteType)) {
        console.log("Error: Invalid vote type:", voteType);
        return res.status(400).json({ message: "Invalid vote type" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        console.log("Error: User not found:", userId);
        return res.status(400).json({ message: "User not found" });
      }
      
      console.log("User found, proceeding with vote");
      await storage.voteAnswer(answerId, userId, voteType);
      console.log("Vote recorded successfully");
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
