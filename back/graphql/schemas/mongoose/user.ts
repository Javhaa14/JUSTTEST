import mongoose from "mongoose";

// 👤 User schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

export const Usermodel = mongoose.model("User", userSchema);
