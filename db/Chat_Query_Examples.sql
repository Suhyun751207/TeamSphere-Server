-- =============================================
-- TeamSphere 채팅 시스템 주요 쿼리 예제
-- =============================================

-- =============================================
-- 1. DM 채팅방 생성 및 관리
-- =============================================

-- DM 채팅방 생성 (두 사용자 간)
INSERT INTO chat_rooms (room_type, created_by) 
VALUES ('DM', 1);

-- DM 참여자 추가 (발신자, 수신자)
INSERT INTO chat_room_participants (room_id, user_id) 
VALUES 
    (LAST_INSERT_ID(), 1),  -- 발신자
    (LAST_INSERT_ID(), 2);  -- 수신자

-- 기존 DM 채팅방 확인 (중복 생성 방지)
SELECT cr.id 
FROM chat_rooms cr
JOIN chat_room_participants crp1 ON cr.id = crp1.room_id
JOIN chat_room_participants crp2 ON cr.id = crp2.room_id
WHERE cr.room_type = 'DM' 
    AND crp1.user_id = 1 
    AND crp2.user_id = 2
    AND crp1.is_active = TRUE 
    AND crp2.is_active = TRUE;

-- =============================================
-- 2. Workspace 채팅방 생성 및 관리
-- =============================================

-- Workspace 채팅방 생성
INSERT INTO chat_rooms (room_type, name, workspace_id, created_by) 
VALUES ('WORKSPACE', 'General', 1, 1);

-- Workspace 모든 멤버를 채팅방에 자동 추가
INSERT INTO chat_room_participants (room_id, user_id)
SELECT LAST_INSERT_ID(), wm.user_id
FROM workspaces_members wm
WHERE wm.workspace_id = 1 AND wm.user_id IS NOT NULL;

-- =============================================
-- 3. Team 채팅방 생성 및 관리
-- =============================================

-- Team 채팅방 생성
INSERT INTO chat_rooms (room_type, name, workspace_id, team_id, created_by) 
VALUES ('TEAM', 'Development Team', 1, 1, 1);

-- Team 멤버들을 채팅방에 자동 추가
INSERT INTO chat_room_participants (room_id, user_id)
SELECT LAST_INSERT_ID(), wm.user_id
FROM workspace_team_users wtu
JOIN workspaces_members wm ON wtu.member_id = wm.id
WHERE wtu.team_id = 1;

-- =============================================
-- 4. 메시지 전송 및 조회
-- =============================================

-- 메시지 전송
INSERT INTO messages (room_id, sender_id, content) 
VALUES (1, 1, 'Hello, how are you?');

-- 채팅방 최근 메시지 업데이트
UPDATE chat_rooms 
SET last_message_at = NOW() 
WHERE id = 1;

-- 채팅방의 메시지 목록 조회 (페이지네이션)
SELECT 
    m.id,
    m.content,
    m.message_type,
    m.sender_id,
    u.email as sender_email,
    p.name as sender_name,
    m.reply_to_id,
    m.file_url,
    m.file_name,
    m.is_edited,
    m.created_at
FROM messages m
JOIN users u ON m.sender_id = u.id
LEFT JOIN profiles p ON u.id = p.user_id
WHERE m.room_id = 1 
    AND m.is_deleted = FALSE
ORDER BY m.created_at DESC
LIMIT 50 OFFSET 0;

-- =============================================
-- 5. 사용자별 채팅방 목록 조회
-- =============================================

-- 사용자의 모든 채팅방 목록 (최근 활동 순)
SELECT 
    ucr.*,
    (SELECT COUNT(*) FROM messages WHERE room_id = ucr.room_id AND is_deleted = FALSE) as total_messages
FROM user_chat_rooms ucr
WHERE ucr.user_id = 1
ORDER BY ucr.last_message_at DESC NULLS LAST;

-- 사용자의 읽지 않은 메시지가 있는 채팅방
SELECT 
    ucr.*
FROM user_chat_rooms ucr
WHERE ucr.user_id = 1 
    AND ucr.unread_count > 0
ORDER BY ucr.last_message_at DESC;

-- =============================================
-- 6. 읽음 상태 관리
-- =============================================

-- 메시지 읽음 처리
INSERT INTO message_read_status (message_id, user_id)
SELECT m.id, 1
FROM messages m
WHERE m.room_id = 1 
    AND m.sender_id != 1
    AND m.id NOT IN (
        SELECT mrs.message_id 
        FROM message_read_status mrs 
        WHERE mrs.user_id = 1
    );

-- 채팅방 참여자의 읽지 않은 메시지 수 업데이트
UPDATE chat_room_participants 
SET 
    unread_count = (
        SELECT COUNT(*)
        FROM messages m
        WHERE m.room_id = chat_room_participants.room_id
            AND m.sender_id != chat_room_participants.user_id
            AND m.created_at > COALESCE(chat_room_participants.last_read_at, '1970-01-01')
            AND m.is_deleted = FALSE
    ),
    last_read_at = NOW()
WHERE room_id = 1 AND user_id = 1;

-- =============================================
-- 7. 검색 쿼리
-- =============================================

-- 사용자의 모든 채팅방에서 메시지 검색
SELECT 
    m.id,
    m.content,
    m.created_at,
    cr.room_type,
    cr.name as room_name,
    u.email as sender_email
FROM messages m
JOIN chat_rooms cr ON m.room_id = cr.id
JOIN chat_room_participants crp ON cr.id = crp.room_id
JOIN users u ON m.sender_id = u.id
WHERE crp.user_id = 1 
    AND crp.is_active = TRUE
    AND m.is_deleted = FALSE
    AND m.content LIKE '%검색어%'
ORDER BY m.created_at DESC
LIMIT 20;

-- 특정 채팅방에서 파일 메시지 검색
SELECT 
    m.id,
    m.file_name,
    m.file_url,
    m.file_size,
    m.created_at,
    u.email as sender_email
FROM messages m
JOIN users u ON m.sender_id = u.id
WHERE m.room_id = 1 
    AND m.message_type IN ('file', 'image')
    AND m.is_deleted = FALSE
ORDER BY m.created_at DESC;

-- =============================================
-- 8. 통계 및 분석 쿼리
-- =============================================

-- 워크스페이스별 채팅방 통계
SELECT 
    w.name as workspace_name,
    COUNT(CASE WHEN cr.room_type = 'WORKSPACE' THEN 1 END) as workspace_rooms,
    COUNT(CASE WHEN cr.room_type = 'TEAM' THEN 1 END) as team_rooms,
    COUNT(DISTINCT crp.user_id) as active_users,
    SUM(
        SELECT COUNT(*) 
        FROM messages 
        WHERE room_id = cr.id AND is_deleted = FALSE
    ) as total_messages
FROM workspaces w
LEFT JOIN chat_rooms cr ON w.id = cr.workspace_id
LEFT JOIN chat_room_participants crp ON cr.id = crp.room_id AND crp.is_active = TRUE
WHERE w.id = 1
GROUP BY w.id, w.name;

-- 사용자별 메시지 활동 통계 (최근 30일)
SELECT 
    u.email,
    COUNT(m.id) as message_count,
    COUNT(DISTINCT m.room_id) as active_rooms,
    MAX(m.created_at) as last_message_at
FROM users u
JOIN messages m ON u.id = m.sender_id
WHERE m.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND m.is_deleted = FALSE
GROUP BY u.id, u.email
ORDER BY message_count DESC;

-- =============================================
-- 9. 정리 및 유지보수 쿼리
-- =============================================

-- 비활성 채팅방 정리 (30일 이상 메시지 없음)
UPDATE chat_rooms 
SET is_active = FALSE 
WHERE last_message_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    OR last_message_at IS NULL;

-- 삭제된 메시지 정리 (90일 이상 된 삭제 메시지)
DELETE FROM messages 
WHERE is_deleted = TRUE 
    AND deleted_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- 읽음 상태 정리 (오래된 읽음 기록 삭제)
DELETE FROM message_read_status 
WHERE read_at < DATE_SUB(NOW(), INTERVAL 180 DAY);

-- =============================================
-- 10. 성능 모니터링 쿼리
-- =============================================

-- 가장 활발한 채팅방 (메시지 수 기준)
SELECT 
    cr.id,
    cr.name,
    cr.room_type,
    COUNT(m.id) as message_count,
    COUNT(DISTINCT crp.user_id) as participant_count
FROM chat_rooms cr
LEFT JOIN messages m ON cr.id = m.room_id AND m.is_deleted = FALSE
LEFT JOIN chat_room_participants crp ON cr.id = crp.room_id AND crp.is_active = TRUE
WHERE cr.is_active = TRUE
GROUP BY cr.id, cr.name, cr.room_type
ORDER BY message_count DESC
LIMIT 10;

-- 데이터베이스 크기 모니터링
SELECT 
    'chat_rooms' as table_name,
    COUNT(*) as row_count,
    ROUND(SUM(LENGTH(name) + LENGTH(description)) / 1024, 2) as size_kb
FROM chat_rooms
UNION ALL
SELECT 
    'messages' as table_name,
    COUNT(*) as row_count,
    ROUND(SUM(LENGTH(content)) / 1024, 2) as size_kb
FROM messages
UNION ALL
SELECT 
    'chat_room_participants' as table_name,
    COUNT(*) as row_count,
    0 as size_kb
FROM chat_room_participants;
