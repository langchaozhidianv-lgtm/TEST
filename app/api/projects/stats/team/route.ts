import { ok } from "@/lib/api";
import { getTeamStatsData } from "@/lib/server-data";

export async function GET() {
  return ok(await getTeamStatsData());
}
