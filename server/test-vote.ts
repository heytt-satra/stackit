import { db } from "./db";
import { questionVotes, answerVotes, users, questions, answers } from "@shared/schema";
import { eq } from "drizzle-orm";

async function testVoting() {
  try {
    console.log("Testing voting functionality...");
    
    // Check if tables exist by trying to select from them
    console.log("Checking if question_votes table exists...");
    const questionVotesCount = await db.select().from(questionVotes).limit(1);
    console.log("question_votes table exists, count:", questionVotesCount.length);
    
    console.log("Checking if answer_votes table exists...");
    const answerVotesCount = await db.select().from(answerVotes).limit(1);
    console.log("answer_votes table exists, count:", answerVotesCount.length);
    
    // Check if we have any users
    console.log("Checking users...");
    const allUsers = await db.select().from(users);
    console.log("Users found:", allUsers.length);
    console.log("Sample user:", allUsers[0]);
    
    // Check if we have any questions
    console.log("Checking questions...");
    const allQuestions = await db.select().from(questions);
    console.log("Questions found:", allQuestions.length);
    console.log("Sample question:", allQuestions[0]);
    
    // Check if we have any answers
    console.log("Checking answers...");
    const allAnswers = await db.select().from(answers);
    console.log("Answers found:", allAnswers.length);
    console.log("Sample answer:", allAnswers[0]);
    
    // Try to insert a test vote
    if (allUsers.length > 0 && allQuestions.length > 0) {
      console.log("Testing vote insertion...");
      const testVote = await db.insert(questionVotes).values({
        questionId: allQuestions[0].id,
        userId: allUsers[0].id,
        voteType: 1,
      }).returning();
      console.log("Test vote inserted:", testVote);
      
      // Clean up test vote
      await db.delete(questionVotes).where(eq(questionVotes.id, testVote[0].id));
      console.log("Test vote cleaned up");
    }
    
    console.log("✅ Voting test completed successfully!");
    
  } catch (error) {
    console.error("❌ Error testing voting:", error);
  }
}

testVoting().then(() => {
  console.log("Test completed");
  process.exit(0);
}).catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
}); 