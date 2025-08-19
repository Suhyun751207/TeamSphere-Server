export const ActivityLogsKeys=['userId','workspaceId','message','createdAt','updatedAt'] as const;
export interface ActivityLogs {
  userId: number;
  workspaceId:number;
  message:string;
  createdAt:Date;
  updatedAt:Date;
}

export type ActivityLogsAutoSetKeys="createdAt"|"updatedAt"
export interface ActivityLogsCreate extends Omit<ActivityLogs, ActivityLogsAutoSetKeys>{};
export interface ActivityLogsUpdate extends Partial<ActivityLogsCreate>{}; 