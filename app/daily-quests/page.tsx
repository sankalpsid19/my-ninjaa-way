import { redirect } from "next/navigation";
import { checkUserModuleAccess } from "@/lib/actions/auth-actions";
import DayBoard from "@/components/daily-quests/DayBoard";

export const dynamic = "force-dynamic";

export default async function DailyQuestsPage() {
  const access = await checkUserModuleAccess("daily-quests");
  if (!access.authorized) redirect("/");
  return (
    <main className="min-h-screen">
      <DayBoard />
    </main>
  );
}