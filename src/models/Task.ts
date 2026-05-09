import { Schema, Document, models, model } from "mongoose";

export interface ITaskDocument extends Document {
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "discarded";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  createdBy: Schema.Types.ObjectId;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "discarded"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
TaskSchema.index({ createdBy: 1, status: 1 });
TaskSchema.index({ createdBy: 1, dueDate: 1 });
TaskSchema.index({ createdBy: 1, priority: 1 });
TaskSchema.index({ title: "text", description: "text" });

const Task = models.Task || model<ITaskDocument>("Task", TaskSchema);
export default Task;
