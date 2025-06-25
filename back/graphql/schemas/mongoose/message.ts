import mongoose from "mongoose";

// 💬 Message schema
const messageSchema = new mongoose.Schema({
  username: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

export const Messagemodel = mongoose.model("Message", messageSchema);
