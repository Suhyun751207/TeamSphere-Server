export interface ChatTypeEnum {
    type: string;
    //workspace
    // team
    // dm
}

export interface Messages {
    id: number;
    chatType: string;
    chatId: number;
    name: string;
    createdAt: string;
    // on update current_timestamp
    updatedAt: string;
}

export interface Message {
    id: number; // Messages.id
    userId: number;
    //message의 
    // type이 dm이면
    // user_id는 user 테이블에서 id가져오기
    // type이 workspace이면
    // workspaces_members에서 id가져오기
    // type이 team이면
    // workspace_team_users에 id 가져오기
    content: string;
    messageType: string | null;
    replyToId: number | null;
    createdAt: string;
    // on update current_timestamp
    updatedAt: string | null;
    isDeleted: number;
    isEdited: number;
}