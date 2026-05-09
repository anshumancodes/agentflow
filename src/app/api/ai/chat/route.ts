import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { getChatResponse } from "@/services/aiService";
import AiChat from "@/models/AiChat";
import type { ITask } from "@/types";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { message, chatId } = await request.json();
  if (!message?.trim()) {
    return Response.json({ success: false, error: "Message is required." }, { status: 400 });
  }

  await connectDB();

  // Fetch user's tasks for context
  const tasks = await Task.find({ createdBy: session.user.id })
    .sort({ dueDate: 1 })
    .limit(50)
    .lean();

  const taskList: ITask[] = tasks.map((t) => ({
    ...t,
    _id: t._id.toString(),
    createdBy: t.createdBy.toString(),
    dueDate: t.dueDate?.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  })) as ITask[];

  let aiResponse: string;
  try {
    aiResponse = await getChatResponse(message, taskList);
  } catch (err) {
    console.error("[AI Chat] Error calling Gemini:", err);
    const isConfig = err instanceof Error && err.message.includes("GEMINI_API_KEY");
    return Response.json(
      {
        success: false,
        error: isConfig
          ? "AI is not configured. Please add your GEMINI_API_KEY."
          : "AI service temporarily unavailable.",
      },
      { status: isConfig ? 503 : 500 }
    );
  }

  // Persist conversation
  const timestamp = new Date().toISOString();
  const userMsg = { role: "user" as const, content: message, timestamp: new Date() };
  const aiMsg = { role: "assistant" as const, content: aiResponse, timestamp: new Date() };

  if (chatId) {
    await AiChat.findByIdAndUpdate(chatId, {
      $push: { messages: { $each: [userMsg, aiMsg] } },
    });
  } else {
    await AiChat.create({ userId: session.user.id, messages: [userMsg, aiMsg] });
  }

  return Response.json({
    success: true,
    data: { response: aiResponse, timestamp },
  });
}
