import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema({
  role:      { type: String, enum: ["user", "assistant", "system"], required: true },
  content:   { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
    passwordHash: { type: String, required: true, select: false },
    chatHistory:  { type: [chatHistorySchema], default: [] },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
