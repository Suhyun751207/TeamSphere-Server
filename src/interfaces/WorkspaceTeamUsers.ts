import { WorkspaceRole } from "../services/ENUM/workspace_roles_enum.ts";

export const WorkspaceTeamUsersKeys = ['id', 'memberId', 'teamId', 'role', 'createdAt', 'updatedAt'] as const;
export interface WorkspaceTeamUsers {
  id: number;
  memberId: number;
  teamId: number;
  role: WorkspaceRole;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkspaceTeamUsersAutoSetKeys = "id" | "createdAt" | "updatedAt"
export interface WorkspaceTeamUsersCreate extends Omit<WorkspaceTeamUsers, WorkspaceTeamUsersAutoSetKeys> { };
export interface WorkspaceTeamUsersUpdate extends Partial<WorkspaceTeamUsersCreate> { }; 