import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import User from "../models/User.js";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("No MONGODB_URI");

  await mongoose.connect(uri);
  console.log("Connected to DB.");

  // Find all users
  const users = await User.find().lean();
  console.log(`Found ${users.length} users.`);

  for (const user of users) {
    console.log(`\nUser: ${user.name} (${user.email}) - ID: ${user._id}`);
    console.log("Chat History length:", user.chatHistory?.length || 0);
    if (user.chatHistory?.length > 0) {
      console.log("Last 5 chat history entries:");
      console.log(JSON.stringify(user.chatHistory.slice(-5), null, 2));
    }
  }

  await mongoose.disconnect();
}

main().catch(console.error);
