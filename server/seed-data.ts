import { db } from "./db";
import { users, questions, answers, tags, questionTags } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedData() {
  try {
    console.log("Starting to seed dummy data...");

    // Create dummy users
    const dummyUsers = [
      {
        id: "user_dummy_1",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        profileImageUrl: null,
      },
      {
        id: "user_dummy_2", 
        email: "jane.smith@example.com",
        firstName: "Jane",
        lastName: "Smith",
        profileImageUrl: null,
      },
      {
        id: "user_dummy_3",
        email: "bob.wilson@example.com", 
        firstName: "Bob",
        lastName: "Wilson",
        profileImageUrl: null,
      },
    ];

    console.log("Creating dummy users...");
    for (const user of dummyUsers) {
      await db.insert(users).values(user).onConflictDoUpdate({
        target: users.id,
        set: user,
      });
    }

    // Create dummy tags
    const dummyTags = [
      { name: "javascript" },
      { name: "react" },
      { name: "typescript" },
      { name: "nodejs" },
      { name: "python" },
      { name: "css" },
      { name: "html" },
      { name: "database" },
    ];

    console.log("Creating dummy tags...");
    for (const tag of dummyTags) {
      await db.insert(tags).values(tag).onConflictDoUpdate({
        target: tags.name,
        set: tag,
      });
    }

    // Create dummy questions
    const dummyQuestions = [
      {
        title: "How do I implement authentication in React with Clerk?",
        content: "I'm building a React app and want to add user authentication. I've heard Clerk is a good option. Can someone help me understand how to implement it step by step? I'm particularly interested in protecting routes and handling user sessions.",
        authorId: "user_dummy_1",
      },
      {
        title: "What's the best way to handle state management in a large React application?",
        content: "My React app is growing and I'm finding it difficult to manage state across components. I've heard about Redux, Zustand, and Context API. Which one would be best for a large application with many components that need to share state?",
        authorId: "user_dummy_2",
      },
      {
        title: "How to deploy a Node.js app to production?",
        content: "I've built a Node.js application and want to deploy it to production. What are the best practices for deployment? I'm looking for recommendations on hosting platforms, environment variables, and security considerations.",
        authorId: "user_dummy_3",
      },
      {
        title: "TypeScript vs JavaScript: When should I use TypeScript?",
        content: "I'm starting a new project and wondering whether to use TypeScript or stick with JavaScript. What are the benefits of TypeScript? Are there any downsides? When would you recommend using TypeScript over JavaScript?",
        authorId: "user_dummy_1",
      },
      {
        title: "How to optimize database queries for better performance?",
        content: "My application is getting slower as the database grows. I'm using PostgreSQL and want to optimize my queries. What are some best practices for writing efficient database queries? How can I identify slow queries and improve them?",
        authorId: "user_dummy_2",
      },
    ];

    console.log("Creating dummy questions...");
    const createdQuestions = [];
    for (const question of dummyQuestions) {
      const [createdQuestion] = await db.insert(questions).values(question).returning();
      createdQuestions.push(createdQuestion);
    }

    // Create dummy answers
    const dummyAnswers = [
      {
        content: "Clerk is excellent for React authentication! Here's how to set it up:\n\n1. Install Clerk: `npm install @clerk/clerk-react`\n2. Wrap your app with ClerkProvider\n3. Use the SignIn and SignUp components\n4. Protect routes with useAuth hook\n\nIt's much easier than building auth from scratch!",
        questionId: createdQuestions[0].id,
        authorId: "user_dummy_2",
      },
      {
        content: "For large React apps, I'd recommend Zustand. It's simpler than Redux but more powerful than Context API. Here's why:\n\n- Lightweight and easy to learn\n- Great TypeScript support\n- No boilerplate code\n- Excellent performance\n\nRedux is overkill for most apps, and Context API can cause unnecessary re-renders.",
        questionId: createdQuestions[1].id,
        authorId: "user_dummy_3",
      },
      {
        content: "I've deployed many Node.js apps. Here are my recommendations:\n\n**Hosting Platforms:**\n- Vercel (great for full-stack)\n- Railway (simple deployment)\n- DigitalOcean (more control)\n\n**Best Practices:**\n- Use environment variables for secrets\n- Set up proper logging\n- Implement health checks\n- Use PM2 for process management",
        questionId: createdQuestions[2].id,
        authorId: "user_dummy_1",
      },
      {
        content: "TypeScript is definitely worth it for most projects! Benefits:\n\n✅ Catch errors at compile time\n✅ Better IDE support and autocomplete\n✅ Easier refactoring\n✅ Self-documenting code\n\nThe learning curve is minimal if you know JavaScript. Start with `strict: false` and gradually enable stricter settings.",
        questionId: createdQuestions[3].id,
        authorId: "user_dummy_2",
      },
      {
        content: "Here are key optimization techniques:\n\n1. **Use indexes** on frequently queried columns\n2. **Limit results** with LIMIT clause\n3. **Select only needed columns** instead of SELECT *\n4. **Use EXPLAIN** to analyze query plans\n5. **Consider pagination** for large datasets\n\nAlso, use connection pooling and consider caching with Redis for frequently accessed data.",
        questionId: createdQuestions[4].id,
        authorId: "user_dummy_3",
      },
    ];

    console.log("Creating dummy answers...");
    for (const answer of dummyAnswers) {
      await db.insert(answers).values(answer);
    }

    // Link questions to tags
    const questionTagLinks = [
      { questionId: createdQuestions[0].id, tagId: 1 }, // React auth - javascript
      { questionId: createdQuestions[0].id, tagId: 2 }, // React auth - react
      { questionId: createdQuestions[1].id, tagId: 1 }, // State management - javascript  
      { questionId: createdQuestions[1].id, tagId: 2 }, // State management - react
      { questionId: createdQuestions[2].id, tagId: 4 }, // Node.js deployment - nodejs
      { questionId: createdQuestions[3].id, tagId: 1 }, // TypeScript - javascript
      { questionId: createdQuestions[3].id, tagId: 3 }, // TypeScript - typescript
      { questionId: createdQuestions[4].id, tagId: 8 }, // Database optimization - database
    ];

    console.log("Linking questions to tags...");
    for (const link of questionTagLinks) {
      await db.insert(questionTags).values(link);
    }

    console.log("✅ Dummy data seeded successfully!");
    console.log(`Created ${dummyUsers.length} users, ${dummyTags.length} tags, ${dummyQuestions.length} questions, and ${dummyAnswers.length} answers`);

  } catch (error) {
    console.error("❌ Error seeding data:", error);
  }
}

// Run the seed function
seedData().then(() => {
  console.log("Seeding completed");
  process.exit(0);
}).catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
}); 