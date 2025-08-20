import { repository, ResultSetHeader } from "mysql2-wizard";
import { workspaceTeamKeys, workspaceTeam, workspaceTeamAutoSetKeys, workspaceTeamCreate } from "../interfaces/workspaceTeams.ts";

const repo =repository<workspaceTeam, workspaceTeamAutoSetKeys>({
  table: 'TeamSphere.workspace_teams',
  keys: workspaceTeamKeys,
  // printQuery: true
});


async function read(): Promise<workspaceTeam[]>;
async function read(id:number): Promise<workspaceTeam|undefined>;
async function read(id?:number ): Promise<workspaceTeam[]|workspaceTeam|undefined>{
  if(!id) return repo.select();
  return repo.select({id})
}

async function create(data:workspaceTeamCreate): Promise<ResultSetHeader>{
  return repo.insert([data]);
};

async function update(id:number,data:workspaceTeamCreate):Promise<ResultSetHeader>{
  return repo.update([[{id},data]])
}

async function _delete(id:number):Promise<ResultSetHeader>{
  return repo.delete([{id}])
}

const workspaceTeamService={
  read,
  create,
  update,
  delete: _delete,
}

export default workspaceTeamService;