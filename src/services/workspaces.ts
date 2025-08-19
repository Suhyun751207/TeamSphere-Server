import { repository } from "mysql2-wizard";
import { workspaceKeys, Workspace, WorkspaceAutoSetKeys } from "../interfaces/workspaces.ts";

const repo =repository<Workspace, WorkspaceAutoSetKeys>({
  table: 'TeamSphere.workspaces',
  keys: workspaceKeys,
  // printQuery: true
});


async function read(): Promise<Workspace[]>;
async function read(id:number): Promise<Workspace|undefined>;
async function read(id?:number ): Promise<Workspace[]|Workspace|undefined>{
  if(!id) return repo.select();
  return repo.select({id})
}

const workspaceService={
  read,
}

export default workspaceService;