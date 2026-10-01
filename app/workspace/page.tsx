import { redirect } from "next/navigation";
import { getSession } from "@/src/auth/session";
import { Workspace } from "@/features/workspace/workspace";

export default async function WorkspacePage({ searchParams }: { searchParams: Promise<{ sample?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const params = await searchParams;
  return <Workspace user={session} startWithSample={params.sample === "1"} />;
}
