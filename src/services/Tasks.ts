import { repository, ResultSetHeader } from "mysql2-wizard";
import { tasks, tasksAutoSetKeys, tasksCreate, tasksKeys } from "../interfaces/Tasks.ts";

const repo = repository<tasks, tasksAutoSetKeys>({
  table: 'TeamSphere.tasks',
  keys: tasksKeys,
  // printQuery: true
});


async function read(): Promise<tasks[]>;
async function read(teamMemberId: number): Promise<tasks | undefined>;
async function read(teamMemberId?: number): Promise<tasks[] | tasks | undefined> {
  if (!teamMemberId) return repo.select();
  return repo.select({ teamMemberId })
}

async function readByTaskId(task_id: number): Promise<tasks[] | undefined> {
  return repo.select({ id: task_id })
}

async function create(data: tasksCreate): Promise<ResultSetHeader> {
  return repo.insert([data]);
};

async function update(id: number, data: tasksCreate): Promise<ResultSetHeader> {
  return repo.update([[{ id }, data]])
}

async function _delete(teamMemberId: number): Promise<ResultSetHeader> {
  return repo.delete([{ teamMemberId }])
}

const tasksService = {
  read,
  readByTaskId,
  create,
  update,
  delete: _delete,
}

export default tasksService;