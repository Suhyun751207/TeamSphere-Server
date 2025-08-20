import { repository, ResultSetHeader } from "mysql2-wizard";
import { workspaceKeys, Workspace, WorkspaceAutoSetKeys, WorkspaceCreate } from "../interfaces/workspaces.ts";

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

async function create(data:WorkspaceCreate): Promise<ResultSetHeader>{
  return repo.insert([data]);
};

async function update(id:number,data:WorkspaceCreate):Promise<ResultSetHeader>{
  return repo.update([[{id},data]])
}

async function _delete(id:number):Promise<ResultSetHeader>{
  return repo.delete([{id}])
}

const workspaceService={
  read,
  create,
  update,
  delete: _delete,
}

export default workspaceService;