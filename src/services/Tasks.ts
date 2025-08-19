import { repository } from "mysql2-wizard";
import { tasks, tasksAutoSetKeys, tasksKeys } from "../interfaces/Tasks.ts";

const repo =repository<tasks, tasksAutoSetKeys>({
  table: 'TeamSphere.tasks',
  keys: tasksKeys,
  // printQuery: true
});


async function read(): Promise<tasks[]>;
async function read(teamMemberId:number): Promise<tasks|undefined>;
async function read(teamMemberId?:number ): Promise<tasks[]|tasks|undefined>{
  if(!teamMemberId) return repo.select();
  return repo.select({teamMemberId})
}

const tasksService={
  read,
}

export default tasksService;