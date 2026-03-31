import { TeamStatsPage } from "@/components/project/team-stats-page";
import { getTeamStatsData } from "@/lib/server-data";

export default async function TeamStatsRoute() {
  return <TeamStatsPage stats={await getTeamStatsData()} />;
}
