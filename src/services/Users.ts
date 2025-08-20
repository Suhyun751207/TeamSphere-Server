import { repository, ResultSetHeader } from "mysql2-wizard";
import { User, UserAutoSetKeys, UserCreate, userKeys } from "../interfaces/Users.ts";

const repo =repository<User, UserAutoSetKeys>({
  table: 'TeamSphere.users',
  keys: userKeys,
  // printQuery: true
});


async function read(): Promise<User[]>;
async function read(id:number): Promise<User|undefined>;
async function read(id?:number ): Promise<User[]|User|undefined>{
  if(!id) return repo.select();
  return repo.select({id})
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


const userService={
  read,
  create,
  update,
  delete: _delete,
}

export default userService;