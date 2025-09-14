import { WorkspaceRole } from "../services/ENUM/workspace_roles_enum";

export const workspaceMemberKeys = ['id', 'workspaceId', 'userId', 'role', 'createdAt', 'updatedAt'] as const;
export interface workspaceMember {
  id: number;
  workspaceId: number;
  userId: number;
  role: WorkspaceRole;
  createdAt: Date;
  updatedAt: Date;
}

export type workspaceMemberAutoSetKeys = "id" | "createdAt" | "updatedAt"
export interface workspaceMemberCreate extends Omit<workspaceMember, workspaceMemberAutoSetKeys> { };
export interface workspaceMemberUpdate extends Partial<workspaceMemberCreate> { }; 