-- =============================================
-- TeamSphere 채팅 시스템 SQL 스키마
-- 지원하는 채팅방 타입: DM, Workspace, Team
-- =============================================

-- 채팅방 타입 ENUM
CREATE TABLE chat_room_types_ENUM (
    type VARCHAR(20) NOT NULL,
    PRIMARY KEY (type)
);

-- 메시지 타입 ENUM
CREATE TABLE message_types_ENUM (
    type VARCHAR(20) NOT NULL,
    PRIMARY KEY (type)
);

-- 채팅방 테이블 (모든 채팅방의 메타데이터)
CREATE TABLE chat_rooms (
    id INT NOT NULL AUTO_INCREMENT,
    room_type VARCHAR(20) NOT NULL,
    name VARCHAR(100) NULL,
    description TEXT NULL,
    workspace_id INT NULL,
    team_id INT NULL,
    created_by INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_message_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_room_type (room_type),
    INDEX idx_workspace_id (workspace_id),
    INDEX idx_team_id (team_id),
    INDEX idx_last_message_at (last_message_at),
    INDEX idx_created_by (created_by)
);

-- 채팅방 참여자 테이블
CREATE TABLE chat_room_participants (
    id INT NOT NULL AUTO_INCREMENT,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_read_at TIMESTAMP NULL,
    unread_count INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY unique_room_user (room_id, user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_room_id (room_id),
    INDEX idx_is_active (is_active),
    INDEX idx_last_read_at (last_read_at)
);

-- 메시지 테이블
CREATE TABLE messages (
    id INT NOT NULL AUTO_INCREMENT,
    room_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'text',
    content TEXT NOT NULL,
    reply_to_id INT NULL,
    file_url TEXT NULL,
    file_name VARCHAR(255) NULL,
    file_size BIGINT NULL,
    is_edited BOOLEAN NOT NULL DEFAULT FALSE,
    edited_at TIMESTAMP NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_room_id_created_at (room_id, created_at),
    INDEX idx_sender_id (sender_id),
    INDEX idx_reply_to_id (reply_to_id),
    INDEX idx_message_type (message_type),
    INDEX idx_is_deleted (is_deleted)
);

-- 메시지 읽음 상태 테이블 (성능 최적화를 위한 별도 테이블)
CREATE TABLE message_read_status (
    id INT NOT NULL AUTO_INCREMENT,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_message_user (message_id, user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_message_id (message_id)
);

-- 메시지 반응 테이블 (이모지 등)
CREATE TABLE message_reactions (
    id INT NOT NULL AUTO_INCREMENT,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    reaction VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_message_user_reaction (message_id, user_id, reaction),
    INDEX idx_message_id (message_id),
    INDEX idx_user_id (user_id)
);

-- ENUM 값 삽입
INSERT INTO chat_room_types_ENUM (type) VALUES 
('DM'),
('WORKSPACE'),
('TEAM');

INSERT INTO message_types_ENUM (type) VALUES 
('text'),
('file'),
('image'),
('system');

-- =============================================
-- 외래 키 제약 조건
-- =============================================

-- chat_rooms 외래 키
ALTER TABLE chat_rooms
    ADD CONSTRAINT FK_chat_room_types_ENUM_TO_chat_rooms
    FOREIGN KEY (room_type) REFERENCES chat_room_types_ENUM (type);

ALTER TABLE chat_rooms
    ADD CONSTRAINT FK_users_TO_chat_rooms_created_by
    FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE chat_rooms
    ADD CONSTRAINT FK_workspaces_TO_chat_rooms
    FOREIGN KEY (workspace_id) REFERENCES workspaces (id);

ALTER TABLE chat_rooms
    ADD CONSTRAINT FK_workspace_teams_TO_chat_rooms
    FOREIGN KEY (team_id) REFERENCES workspace_teams (id);

-- chat_room_participants 외래 키
ALTER TABLE chat_room_participants
    ADD CONSTRAINT FK_chat_rooms_TO_participants
    FOREIGN KEY (room_id) REFERENCES chat_rooms (id) ON DELETE CASCADE;

ALTER TABLE chat_room_participants
    ADD CONSTRAINT FK_users_TO_participants
    FOREIGN KEY (user_id) REFERENCES users (id);

-- messages 외래 키
ALTER TABLE messages
    ADD CONSTRAINT FK_chat_rooms_TO_messages
    FOREIGN KEY (room_id) REFERENCES chat_rooms (id) ON DELETE CASCADE;

ALTER TABLE messages
    ADD CONSTRAINT FK_users_TO_messages_sender
    FOREIGN KEY (sender_id) REFERENCES users (id);

ALTER TABLE messages
    ADD CONSTRAINT FK_message_types_ENUM_TO_messages
    FOREIGN KEY (message_type) REFERENCES message_types_ENUM (type);

ALTER TABLE messages
    ADD CONSTRAINT FK_messages_TO_reply
    FOREIGN KEY (reply_to_id) REFERENCES messages (id);

-- message_read_status 외래 키
ALTER TABLE message_read_status
    ADD CONSTRAINT FK_messages_TO_read_status
    FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE;

ALTER TABLE message_read_status
    ADD CONSTRAINT FK_users_TO_read_status
    FOREIGN KEY (user_id) REFERENCES users (id);

-- message_reactions 외래 키
ALTER TABLE message_reactions
    ADD CONSTRAINT FK_messages_TO_reactions
    FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE;

ALTER TABLE message_reactions
    ADD CONSTRAINT FK_users_TO_reactions
    FOREIGN KEY (user_id) REFERENCES users (id);

-- =============================================
-- 효율적인 쿼리를 위한 추가 인덱스
-- =============================================

-- 복합 인덱스 (성능 최적화)
CREATE INDEX idx_chat_rooms_workspace_type ON chat_rooms (workspace_id, room_type);
CREATE INDEX idx_chat_rooms_team_type ON chat_rooms (team_id, room_type);
CREATE INDEX idx_participants_user_active ON chat_room_participants (user_id, is_active);
CREATE INDEX idx_messages_room_created_deleted ON messages (room_id, created_at, is_deleted);
CREATE INDEX idx_messages_sender_created ON messages (sender_id, created_at);

-- =============================================
-- 유용한 뷰 (View) 정의
-- =============================================

-- 사용자별 채팅방 목록 뷰
CREATE VIEW user_chat_rooms AS
SELECT 
    cr.id as room_id,
    cr.room_type,
    cr.name,
    cr.description,
    cr.workspace_id,
    cr.team_id,
    cr.last_message_at,
    crp.user_id,
    crp.unread_count,
    crp.last_read_at,
    crp.joined_at,
    CASE 
        WHEN cr.room_type = 'DM' THEN (
            SELECT u.email 
            FROM chat_room_participants crp2 
            JOIN users u ON crp2.user_id = u.id 
            WHERE crp2.room_id = cr.id AND crp2.user_id != crp.user_id 
            LIMIT 1
        )
        WHEN cr.room_type = 'WORKSPACE' THEN w.name
        WHEN cr.room_type = 'TEAM' THEN wt.name
    END as display_name
FROM chat_rooms cr
JOIN chat_room_participants crp ON cr.id = crp.room_id
LEFT JOIN workspaces w ON cr.workspace_id = w.id
LEFT JOIN workspace_teams wt ON cr.team_id = wt.id
WHERE crp.is_active = TRUE AND cr.is_active = TRUE;

-- 최근 메시지 포함 채팅방 뷰
CREATE VIEW chat_rooms_with_last_message AS
SELECT 
    cr.*,
    m.content as last_message_content,
    m.sender_id as last_message_sender_id,
    u.email as last_message_sender_email,
    m.created_at as last_message_created_at
FROM chat_rooms cr
LEFT JOIN messages m ON cr.id = m.room_id AND m.created_at = cr.last_message_at
LEFT JOIN users u ON m.sender_id = u.id
WHERE cr.is_active = TRUE;
