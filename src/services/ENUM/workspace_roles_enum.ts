export const workspace_roles_enum=['Admin','Manager','Member','Viewer'] as const;


export type WorkspaceRole= typeof workspace_roles_enum[number]; 
