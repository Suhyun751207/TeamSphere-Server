export const task_priority_enum = ['High', 'Low', 'Medium'] as const;


export type TaskPriority = typeof task_priority_enum[number]; 
