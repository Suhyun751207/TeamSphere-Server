export const workspaceTeamKeys=['id','name','workspaceId','managerId'] as const;
export interface workspaceTeam {
  id: number;
  name:string | null;
  workspaceId:number;
  managerId:number;
}

export type workspaceTeamAutoSetKeys="id"
export interface workspaceTeamCreate extends Omit<workspaceTeam, workspaceTeamAutoSetKeys>{};
export interface workspaceTeamUpdate extends Partial<workspaceTeamCreate>{}; 