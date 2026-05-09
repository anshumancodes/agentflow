import { Schema, Document, models, model } from "mongoose";

interface ChatMessageSchema {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IAiChatDocument extends Document {
  userId: Schema.Types.ObjectId;
  messages: ChatMessageSchema[];
  createdAt: Date;
  updatedAt: Date;
}

const AiChatSchema = new Schema<IAiChatDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

AiChatSchema.index({ userId: 1, createdAt: -1 });

const AiChat = models.AiChat || model<IAiChatDocument>("AiChat", AiChatSchema);
export default AiChat;
