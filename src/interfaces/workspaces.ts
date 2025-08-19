export const workspaceKeys = ['id', 'adminId', 'name', 'description', 'createdAt', 'updatedAt'] as const;
export interface Workspace {
  id: number;
  adminId: number;
  name: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkspaceAutoSetKeys = "id" | "createdAt" | "updatedAt"
export interface WorkspaceCreate extends Omit<Workspace, WorkspaceAutoSetKeys> { };
export interface WorkspaceUpdate extends Partial<WorkspaceCreate> { }; 