import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { generateEmailDraft } from "@/services/aiService";
import type { ITask, EmailTone } from "@/types";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { taskIds, tone = "professional" } = await request.json() as {
    taskIds?: string[];
    tone?: EmailTone;
  };

  if (!["professional", "friendly", "concise"].includes(tone)) {
    return Response.json({ success: false, error: "Invalid tone." }, { status: 400 });
  }

  await connectDB();

  const query: Record<string, unknown> = { createdBy: session.user.id };
  if (taskIds?.length) query._id = { $in: taskIds };

  const tasks = await Task.find(query).limit(20).lean();
  const taskList: ITask[] = tasks.map((t) => ({
    ...t,
    _id: t._id.toString(),
    createdBy: t.createdBy.toString(),
    dueDate: t.dueDate?.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  })) as ITask[];

  try {
    const emailDraft = await generateEmailDraft(taskList, tone);
    return Response.json({ success: true, data: { email: emailDraft } });
  } catch (err) {
    const isConfig = err instanceof Error && err.message.includes("GEMINI_API_KEY");
    return Response.json(
      {
        success: false,
        error: isConfig
          ? "AI is not configured. Please add your GEMINI_API_KEY."
          : "Failed to generate email.",
      },
      { status: isConfig ? 503 : 500 }
    );
  }
}
