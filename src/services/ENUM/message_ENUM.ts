export const message_ENUM = ['TEXT', 'FILE', 'IMAGE'] as const;


export type MessageType = typeof message_ENUM[number]; 
