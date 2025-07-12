import { db } from "./db";
import { sql } from "drizzle-orm";

async function migrateVotes() {
  try {
    console.log("Starting vote table migration...");
    
    // Add unique constraint to question_votes table
    console.log("Adding unique constraint to question_votes...");
    await db.execute(sql`
      ALTER TABLE question_votes 
      ADD CONSTRAINT question_votes_unique_vote 
      UNIQUE (question_id, user_id)
    `);
    console.log("✅ Unique constraint added to question_votes");
    
    // Add unique constraint to answer_votes table
    console.log("Adding unique constraint to answer_votes...");
    await db.execute(sql`
      ALTER TABLE answer_votes 
      ADD CONSTRAINT answer_votes_unique_vote 
      UNIQUE (answer_id, user_id)
    `);
    console.log("✅ Unique constraint added to answer_votes");
    
    console.log("✅ Vote table migration completed successfully!");
    
  } catch (error) {
    console.error("❌ Error during migration:", error);
    
    // Check if constraints already exist
    if (error.message?.includes("already exists")) {
      console.log("Constraints already exist, migration not needed");
    } else {
      throw error;
    }
  }
}

migrateVotes().then(() => {
  console.log("Migration completed");
  process.exit(0);
}).catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
}); 