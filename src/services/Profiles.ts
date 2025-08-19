import { repository } from "mysql2-wizard";
import { profiles, profilesAutoSetKeys, profilesKeys } from "../interfaces/Profiles.ts";

const repo =repository<profiles, profilesAutoSetKeys>({
  table: 'TeamSphere.profiles',
  keys: profilesKeys,
  // printQuery: true
});


async function read(): Promise<profiles[]>;
async function read(id:number): Promise<profiles|undefined>;
async function read(id?:number ): Promise<profiles[]|profiles|undefined>{
  if(!id) return repo.select();
  return repo.select({userId:id})
}

const profilesService={
  read,
}

export default profilesService;