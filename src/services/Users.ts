import { repository } from "mysql2-wizard";
import { User, UserAutoSetKeys, userKeys } from "../interfaces/Users.ts";

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

const userService={
  read,
}

export default userService;