import { ok } from "@/lib/api";
import { getTeamStats } from "@/lib/mock-data";

export async function GET() {
  return ok(getTeamStats());
}
