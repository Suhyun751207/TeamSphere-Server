import { repository, ResultSetHeader } from "mysql2-wizard";
import { ActivityLogs, ActivityLogsAutoSetKeys, ActivityLogsCreate, ActivityLogsKeys } from "../interfaces/ActivityLogs.ts";

const repo =repository<ActivityLogs, ActivityLogsAutoSetKeys>({
  table: 'TeamSphere.activity_logs',
  keys: ActivityLogsKeys,
  // printQuery: true
});


async function read(): Promise<ActivityLogs[]>;
async function read(userId:number): Promise<ActivityLogs|undefined>;
async function read(userId?:number ): Promise<ActivityLogs[]|ActivityLogs|undefined>{
  if(!userId) return repo.select();
  return repo.select({userId})
}

async function readByWorkspaceId(workspaceId:number): Promise<ActivityLogs[]|undefined>{
  return repo.select({workspaceId})
}

async function readByUserId(userId:number): Promise<ActivityLogs[]|undefined>{
  return repo.select({userId})
}

async function create(data:ActivityLogsCreate): Promise<ResultSetHeader>{
  return repo.insert([data]);
};

async function update(userId:number,data:ActivityLogsCreate):Promise<ResultSetHeader>{
  return repo.update([[{userId},data]])
}

async function _delete(userId:number):Promise<ResultSetHeader>{
  return repo.delete([{userId}])
}

const activityLogsService={
  read,
  readByUserId,
  readByWorkspaceId,
  create,
  update,
  delete: _delete,
}

export default activityLogsService;