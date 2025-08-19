import { repository } from "mysql2-wizard";
import { ActivityLogs, ActivityLogsAutoSetKeys, ActivityLogsKeys } from "../interfaces/ActivityLogs.ts";

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

const activityLogsService={
  read,
}

export default activityLogsService;