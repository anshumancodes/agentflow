import { auth } from "@/lib/auth";
import { getAnalytics } from "@/services/analyticsService";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const data = await getAnalytics();
  return Response.json({ success: true, data });
}
