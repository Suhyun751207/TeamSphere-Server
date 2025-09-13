import { repository, ResultSetHeader } from "mysql2-wizard";
import { WorkspaceTeamUsersKeys, WorkspaceTeamUsers, WorkspaceTeamUsersAutoSetKeys, WorkspaceTeamUsersCreate } from "../interfaces/WorkspaceTeamUsers.ts";

const repo = repository<WorkspaceTeamUsers, WorkspaceTeamUsersAutoSetKeys>({
  table: 'TeamSphere.workspace_team_users',
  keys: WorkspaceTeamUsersKeys,
  // printQuery: true
});


async function read(): Promise<WorkspaceTeamUsers[]>;
async function read(memberId: number): Promise<WorkspaceTeamUsers | undefined>;
async function read(memberId?: number): Promise<WorkspaceTeamUsers[] | WorkspaceTeamUsers | undefined> {
  if (!memberId) return repo.select();
  return repo.select({ memberId })
}

async function readByTeamId(teamId: number): Promise<WorkspaceTeamUsers[]> {
  return repo.select({ teamId })
}


async function readByMemberId(memberId: number): Promise<WorkspaceTeamUsers[]> {
  return repo.select({ memberId })
}
async function readId(id: number): Promise<WorkspaceTeamUsers[]> {
  return repo.select({ id })
}

async function readIdAndTeamId(id: number, teamId: number): Promise<WorkspaceTeamUsers[]> {
  return repo.select({ id, teamId })
}

async function readTeamId(teamId: number): Promise<WorkspaceTeamUsers[]> {
  return repo.select({ teamId })
}

async function readMemberIdAndTeamId(memberId: number, teamId: number): Promise<WorkspaceTeamUsers[]> {
  return repo.select({ id: memberId, teamId })
}

async function create(data: WorkspaceTeamUsersCreate): Promise<ResultSetHeader> {
  return repo.insert([data]);
};

async function update(id: number, teamId: number, data: WorkspaceTeamUsersCreate): Promise<ResultSetHeader> {
  return repo.update([[{ id, teamId }, data]])
}

async function _delete(id: number): Promise<ResultSetHeader> {
  return repo.delete([{ id }])
}

const workspaceTeamUsersService = {
  read,
  readId,
  readTeamId,
  readIdAndTeamId,
  readMemberIdAndTeamId,
  readByTeamId,
  readByMemberId,
  create,
  update,
  delete: _delete,
}

export default workspaceTeamUsersService;