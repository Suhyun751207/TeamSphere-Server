export const chat_type_enum = ['workspace', 'team', 'dm'] as const;
export const message_type_enum = ['text', 'file', 'image'] as const;

export type ChatType = typeof chat_type_enum[number];
export type MessageType = typeof message_type_enum[number];
