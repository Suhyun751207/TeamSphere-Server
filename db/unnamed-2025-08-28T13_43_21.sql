
CREATE TABLE message
(
  id         INT           NOT NULL DEFAULT auto_increment,
  room_id    INT           NOT NULL,
  type       VARCHAR       NOT NULL,
  content    VARCHAR(2048) NULL    ,
  image_Path VARCHAR(2048) NULL    ,
  isEdit     TINYINT       NULL    ,
  isValid    TINYINT       NULL    ,
  created_at TIMESTAMP     NOT NULL DEFAULT current_timestamp,
  updated_at TIMESTAMP     NOT NULL DEFAULT current_timestamp COMMENT 'on update current_timestamp',
  PRIMARY KEY (id)
);

CREATE TABLE message_ENUM
(
  type VARCHAR NOT NULL,
  PRIMARY KEY (type)
);

CREATE TABLE room_ENUM
(
  type VARCHAR(12) NOT NULL,
  PRIMARY KEY (type)
);

CREATE TABLE room_user
(
  id              INT NOT NULL,
  user_id         INT NOT NULL,
  last_message_id INT NOT NULL
);

CREATE TABLE rooms
(
  id              INT          NOT NULL DEFAULT auto_increment,
  type            VARCHAR(12)  NOT NULL,
  room_id         INT          NULL    ,
  title           VARCHAR(128) NULL    ,
  last_message_id INT          NOT NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT current_timestamp,
  updated_at      TIMESTAMP    NOT NULL DEFAULT current_timestamp COMMENT 'on update current_timestamp',
  PRIMARY KEY (id)
);

ALTER TABLE rooms
  ADD CONSTRAINT FK_room_ENUM_TO_rooms
    FOREIGN KEY (type)
    REFERENCES room_ENUM (type);

ALTER TABLE message
  ADD CONSTRAINT FK_rooms_TO_message
    FOREIGN KEY (room_id)
    REFERENCES rooms (id);

ALTER TABLE rooms
  ADD CONSTRAINT FK_message_TO_rooms
    FOREIGN KEY (last_message_id)
    REFERENCES message (id);

ALTER TABLE message
  ADD CONSTRAINT FK_message_ENUM_TO_message
    FOREIGN KEY (type)
    REFERENCES message_ENUM (type);

ALTER TABLE room_user
  ADD CONSTRAINT FK_rooms_TO_room_user
    FOREIGN KEY (id)
    REFERENCES rooms (id);

ALTER TABLE room_user
  ADD CONSTRAINT FK_message_TO_room_user
    FOREIGN KEY (last_message_id)
    REFERENCES message (id);
