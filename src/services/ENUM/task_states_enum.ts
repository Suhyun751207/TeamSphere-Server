export const task_states_enum = ['Done', 'In Progress', 'To Do'] as const;


export type TaskState = typeof task_states_enum[number]; 
