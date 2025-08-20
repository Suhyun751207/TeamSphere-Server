import { repository, ResultSetHeader } from "mysql2-wizard";
import { workspaceMemberKeys, workspaceMember, workspaceMemberAutoSetKeys, workspaceMemberCreate } from "../interfaces/workspacesMembers.ts";

const repo =repository<workspaceMember, workspaceMemberAutoSetKeys>({
  table: 'TeamSphere.workspaces_members',
  keys: workspaceMemberKeys,
  // printQuery: true
});


async function read(): Promise<workspaceMember[]>;
async function read(workspaceId:number): Promise<workspaceMember|undefined>;
async function read(workspaceId?:number ): Promise<workspaceMember[]|workspaceMember|undefined>{
  if(!workspaceId) return repo.select();
  return repo.select({workspaceId})
}

async function readByUserId(userId: number): Promise<workspaceMember[]> {
  return repo.select({userId});
}

async function readByWorkspacesIdUserId(workspaceId: number, userId: number): Promise<workspaceMember[]> {
  return repo.select({workspaceId, userId});
}


async function create(data:workspaceMemberCreate): Promise<ResultSetHeader>{
  return repo.insert([data]);
};

async function update(id:number,data:workspaceMemberCreate):Promise<ResultSetHeader>{
  return repo.update([[{id},data]])
}

async function _delete(userId:number):Promise<ResultSetHeader>{
  return repo.delete([{userId}])
}

const workspaceMemberService={
  read,
  readByUserId,
  readByWorkspacesIdUserId,
  create,
  update,
  delete: _delete,
}

export default workspaceMemberService;