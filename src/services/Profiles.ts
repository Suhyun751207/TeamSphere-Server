import { repository, ResultSetHeader } from "mysql2-wizard";
import { profiles, profilesAutoSetKeys, profilesCreate, profilesKeys } from "../interfaces/Profiles";

const repo =repository<profiles, profilesAutoSetKeys>({
  table: 'TeamSphere.profiles',
  keys: profilesKeys,
  // printQuery: true
});


async function read(): Promise<profiles[]>;
async function read(userId:number): Promise<profiles|undefined>;
async function read(userId?:number ): Promise<profiles[]|profiles|undefined>{
  if(!userId) return repo.select();
  return repo.select({userId})
}

async function readById(id: number): Promise<profiles | undefined> {
  const rows = await repo.select({ userId: id });
  return rows[0];
}


async function create(data:profilesCreate): Promise<ResultSetHeader>{
  return repo.insert([data]);
};

async function update(userId:number,data:profilesCreate):Promise<ResultSetHeader>{
  return repo.update([[{userId},data]])
}

async function _delete(userId:number):Promise<ResultSetHeader>{
  return repo.delete([{userId}])
}


const profilesService={
  read,
  readById,
  create,
  update,
  delete: _delete,
}

export default profilesService;