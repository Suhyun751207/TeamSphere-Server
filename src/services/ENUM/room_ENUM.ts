export const room_ENUM = ['DM', 'WORKSPACE', 'TEAM'] as const;


export type RoomType = typeof room_ENUM[number]; 
