import { repository } from "mysql2-wizard";
import { workspaceMemberKeys, workspaceMember, workspaceMemberAutoSetKeys } from "../interfaces/workspacesMembers.ts";

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

const workspaceMemberService={
  read,
}

export default workspaceMemberService;