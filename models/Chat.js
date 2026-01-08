import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userMessage: String,
    botReply: String,
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);
