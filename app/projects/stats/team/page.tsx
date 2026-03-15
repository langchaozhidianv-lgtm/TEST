import { TeamStatsPage } from "@/components/project/team-stats-page";
import { getTeamStats } from "@/lib/mock-data";

export default function TeamStatsRoute() {
  return <TeamStatsPage stats={getTeamStats()} />;
}
