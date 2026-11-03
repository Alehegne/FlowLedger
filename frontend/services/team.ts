import { api } from "@/lib/api/client";
import type { TeamMember } from "@/types/invoice";

export const teamService = {
  async getTeamMembers(): Promise<TeamMember[]> {
    return api.get<TeamMember[]>("v1/organizations/team");
  },
};
