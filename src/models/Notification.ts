import { Schema, Document, models, model } from "mongoose";

export interface INotificationDocument extends Document {
  userId: Schema.Types.ObjectId;
  taskId?: Schema.Types.ObjectId;
  message: string;
  type: "deadline" | "reminder" | "info";
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["deadline", "reminder", "info"],
      default: "info",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1 });

const Notification =
  models.Notification ||
  model<INotificationDocument>("Notification", NotificationSchema);
export default Notification;
