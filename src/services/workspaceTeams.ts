import { repository } from "mysql2-wizard";
import { workspaceTeamKeys, workspaceTeam, workspaceTeamAutoSetKeys } from "../interfaces/workspaceTeams.ts";

const repo =repository<workspaceTeam, workspaceTeamAutoSetKeys>({
  table: 'TeamSphere.workspace_teams',
  keys: workspaceTeamKeys,
  // printQuery: true
});


async function read(): Promise<workspaceTeam[]>;
async function read(workspaceId:number): Promise<workspaceTeam|undefined>;
async function read(workspaceId?:number ): Promise<workspaceTeam[]|workspaceTeam|undefined>{
  if(!workspaceId) return repo.select();
  return repo.select({workspaceId})
}

const workspaceTeamService={
  read,
}

export default workspaceTeamService;