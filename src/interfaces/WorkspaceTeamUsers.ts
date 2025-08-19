import { WorkspaceRole } from "../services/ENUM/workspace_roles_enum.ts";

export const userKeys = ['id', 'memberId', 'teamId', 'role', 'createdAt', 'updatedAt'] as const;
export interface User {
  id: number;
  memberId: string;
  teamId: string;
  role: WorkspaceRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserAutoSetKeys = "id" | "createdAt" | "updatedAt"
export interface UserCreate extends Omit<User, UserAutoSetKeys> { };
export interface UserUpdate extends Partial<UserCreate> { }; 