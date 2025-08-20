import { repository, ResultSetHeader } from "mysql2-wizard";
import { userKeys, User, UserAutoSetKeys, UserCreate } from "../interfaces/WorkspaceTeamUsers.ts";

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

async function create(data:UserCreate): Promise<ResultSetHeader>{
  return repo.insert([data]);
};

async function update(id:number,data:UserCreate):Promise<ResultSetHeader>{
  return repo.update([[{id},data]])
}

async function _delete(id:number):Promise<ResultSetHeader>{
  return repo.delete([{id}])
}

const workspaceTeamUsersService={
  read,
  create,
  update,
  delete: _delete,
}

export default workspaceTeamUsersService;