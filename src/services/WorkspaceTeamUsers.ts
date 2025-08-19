import { repository } from "mysql2-wizard";
import { userKeys, User, UserAutoSetKeys } from "../interfaces/WorkspaceTeamUsers.ts";

const repo =repository<User, UserAutoSetKeys>({
  table: 'TeamSphere.workspace_team_users',
  keys: userKeys,
  // printQuery: true
});


async function read(): Promise<User[]>;
async function read(memberId:string): Promise<User|undefined>;
async function read(memberId?:string ): Promise<User[]|User|undefined>{
  if(!memberId) return repo.select();
  return repo.select({memberId})
}

const workspaceTeamUsersService={
  read,
}

export default workspaceTeamUsersService;