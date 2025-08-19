export const workspaceTeamKeys=['id','workspaceId','managerId'] as const;
export interface workspaceTeam {
  id: number;
  workspaceId:number;
  managerId:number;
}

export type workspaceTeamAutoSetKeys="id"
export interface workspaceTeamCreate extends Omit<workspaceTeam, workspaceTeamAutoSetKeys>{};
export interface workspaceTeamUpdate extends Partial<workspaceTeamCreate>{}; 