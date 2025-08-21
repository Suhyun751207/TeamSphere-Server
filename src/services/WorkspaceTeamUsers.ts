import { repository, ResultSetHeader } from "mysql2-wizard";
import { userKeys, User, UserAutoSetKeys, UserCreate } from "../interfaces/WorkspaceTeamUsers.ts";

const repo = repository<User, UserAutoSetKeys>({
  table: 'TeamSphere.workspace_team_users',
  keys: userKeys,
  // printQuery: true
});


async function read(): Promise<User[]>;
async function read(memberId: number): Promise<User | undefined>;
async function read(memberId?: number): Promise<User[] | User | undefined> {
  if (!memberId) return repo.select();
  return repo.select({ memberId })
}

async function readByTeamId(teamId: number): Promise<User[]> {
  return repo.select({ teamId })
}

async function readId(id: number): Promise<User[]> {
  return repo.select({ id })
}

async function readIdAndTeamId(id: number, teamId: number): Promise<User[]> {
  return repo.select({ id, teamId })
}

async function readMemberIdAndTeamId(memberId: number, teamId: number): Promise<User[]> {
  return repo.select({ memberId, teamId })
}

async function create(data: UserCreate): Promise<ResultSetHeader> {
  return repo.insert([data]);
};

async function update(id: number, teamId: number, data: UserCreate): Promise<ResultSetHeader> {
  return repo.update([[{ id, teamId }, data]])
}

async function _delete(id: number): Promise<ResultSetHeader> {
  return repo.delete([{ id }])
}

const workspaceTeamUsersService = {
  read,
  readId,
  readIdAndTeamId,
  readMemberIdAndTeamId,
  readByTeamId,
  create,
  update,
  delete: _delete,
}

export default workspaceTeamUsersService;