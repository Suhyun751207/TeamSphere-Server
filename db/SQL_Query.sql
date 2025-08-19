
CREATE TABLE activity_logs
(
  user_id      INT           NOT NULL,
  workspace_id INT           NOT NULL,
  message      VARCHAR(1024) NOT NULL,
  created_at   TIMESTAMP     NOT NULL DEFAULT current_timestamp,
  updated_at   TIMESTAMP     NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp
);

CREATE TABLE genders_ENUM 
(
  gender VARCHAR(20) NOT NULL,
  PRIMARY KEY (gender)
);

CREATE TABLE profiles
(
  user_id            INT          NOT NULL,
  name               VARCHAR(100) NOT NULL,
  age                TINYINT(4)   NULL    ,
  gender             VARCHAR(20)  NOT NULL,
  phone              VARCHAR(20)  NULL    ,
  image_path         TEXT         NULL    ,
  subscription_state VARCHAR(12)  NOT NULL,
  created_at         TIMESTAMP    NOT NULL DEFAULT current_timestamp,
  updated_at         TIMESTAMP    NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp
);

CREATE TABLE subscription_states_ENUM
(
  state VARCHAR(12) NOT NULL,
  PRIMARY KEY (state)
);

CREATE TABLE task_priority_ENUM
(
  priority VARCHAR(24) NOT NULL,
  PRIMARY KEY (priority)
);

CREATE TABLE task_states_ENUM
(
  state VARCHAR(20) NOT NULL,
  PRIMARY KEY (state)
);

CREATE TABLE tasks
(
  team_member_id INT           NOT NULL,
  state          VARCHAR(20)   NOT NULL,
  priority       VARCHAR(24)   NOT NULL,
  task           VARCHAR(1024) NULL    ,
  external_id    VARCHAR(72)   NOT NULL,
  created_at     TIMESTAMP     NOT NULL DEFAULT current_timestamp,
  updated_at     TIMESTAMP     NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp
);

CREATE TABLE users
(
  id         INT          NOT NULL auto_increment,
  email      VARCHAR(255) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT current_timestamp,
  updated_at TIMESTAMP    NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp,
  PRIMARY KEY (id)
);

CREATE TABLE workspace_roles_ENUM
(
  role VARCHAR(12) NOT NULL,
  PRIMARY KEY (role)
);

CREATE TABLE workspace_team_users
(
  id         INT         NOT NULL auto_increment,
  member_id  INT         NOT NULL,
  team_id    INT         NOT NULL,
  role       VARCHAR(12) NOT NULL,
  created_at TIMESTAMP   NOT NULL DEFAULT current_timestamp,
  updated_at TIMESTAMP   NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp,
  PRIMARY KEY (id)
);

CREATE TABLE workspace_teams
(
  id           INT NOT NULL auto_increment,
  workspace_id INT NOT NULL,
  manager_id   INT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE workspaces
(
  id          INT           NOT NULL auto_increment,
  admin_id    INT           NOT NULL,
  name        VARCHAR(72)   NULL    ,
  description VARCHAR(1024) NULL    ,
  created_at  TIMESTAMP     NOT NULL DEFAULT current_timestamp,
  updated_at  TIMESTAMP     NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp,
  PRIMARY KEY (id)
);

CREATE TABLE workspaces_members
(
  id           INT         NOT NULL auto_increment,
  workspace_id INT         NOT NULL,
  user_id      INT         NOT NULL,
  role         VARCHAR(12) NOT NULL,
  created_at   TIMESTAMP   NOT NULL DEFAULT current_timestamp,
  updated_at   TIMESTAMP   NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp,
  PRIMARY KEY (id)
);

insert into subscription_states_ENUM (state) values ('Free');
insert into subscription_states_ENUM (state) values ('Pro');
insert into subscription_states_ENUM (state) values ('Team');

insert into workspace_roles_ENUM (role) values ('Admin');
insert into workspace_roles_ENUM (role) values ('Manager');
insert into workspace_roles_ENUM (role) values ('Member');
insert into workspace_roles_ENUM (role) values ('Viewer');

insert into task_priority_ENUM (priority) values ('Low');
insert into task_priority_ENUM (priority) values ('Medium');
insert into task_priority_ENUM (priority) values ('High');

insert into task_states_ENUM (state) values ('To Do');
insert into task_states_ENUM (state) values ('In Progress');
insert into task_states_ENUM (state) values ('Done');

insert into genders_ENUM (gender) values ('MALE');
insert into genders_ENUM (gender) values ('FEMALE');
insert into genders_ENUM (gender) values ('PRIVATE');
insert into genders_ENUM (gender) values ('UNSPECIFIED');

ALTER TABLE profiles
  ADD CONSTRAINT FK_users_TO_profiles
    FOREIGN KEY (user_id)
    REFERENCES users (id);

ALTER TABLE profiles
  ADD CONSTRAINT FK_subscription_states_ENUM_TO_profiles
    FOREIGN KEY (subscription_state)
    REFERENCES subscription_states_ENUM (state);

ALTER TABLE workspaces_members
  ADD CONSTRAINT FK_workspaces_TO_workspaces_members
    FOREIGN KEY (workspace_id)
    REFERENCES workspaces (id);

ALTER TABLE workspaces_members
  ADD CONSTRAINT FK_users_TO_workspaces_members
    FOREIGN KEY (user_id)
    REFERENCES users (id);

ALTER TABLE workspaces_members
  ADD CONSTRAINT FK_workspace_roles_ENUM_TO_workspaces_members
    FOREIGN KEY (role)
    REFERENCES workspace_roles_ENUM (role);

ALTER TABLE activity_logs
  ADD CONSTRAINT FK_workspaces_TO_activity_logs
    FOREIGN KEY (workspace_id)
    REFERENCES workspaces (id);

ALTER TABLE workspaces
  ADD CONSTRAINT FK_users_TO_workspaces
    FOREIGN KEY (admin_id)
    REFERENCES users (id);

ALTER TABLE workspace_teams
  ADD CONSTRAINT FK_workspaces_TO_workspace_teams
    FOREIGN KEY (workspace_id)
    REFERENCES workspaces (id);

ALTER TABLE workspace_teams
  ADD CONSTRAINT FK_users_TO_workspace_teams
    FOREIGN KEY (manager_id)
    REFERENCES users (id);

ALTER TABLE workspace_team_users
  ADD CONSTRAINT FK_workspace_teams_TO_workspace_team_users
    FOREIGN KEY (team_id)
    REFERENCES workspace_teams (id);

ALTER TABLE workspace_team_users
  ADD CONSTRAINT FK_workspace_roles_ENUM_TO_workspace_team_users
    FOREIGN KEY (role)
    REFERENCES workspace_roles_ENUM (role);

ALTER TABLE workspace_team_users
  ADD CONSTRAINT FK_workspaces_members_TO_workspace_team_users
    FOREIGN KEY (member_id)
    REFERENCES workspaces_members (id);

ALTER TABLE tasks
  ADD CONSTRAINT FK_task_states_ENUM_TO_tasks
    FOREIGN KEY (state)
    REFERENCES task_states_ENUM (state);

ALTER TABLE tasks
  ADD CONSTRAINT FK_task_priority_ENUM_TO_tasks
    FOREIGN KEY (priority)
    REFERENCES task_priority_ENUM (priority);

ALTER TABLE activity_logs
  ADD CONSTRAINT FK_workspaces_members_TO_activity_logs
    FOREIGN KEY (user_id)
    REFERENCES workspaces_members (id);

ALTER TABLE tasks
  ADD CONSTRAINT FK_workspace_team_users_TO_tasks
    FOREIGN KEY (team_member_id)
    REFERENCES workspace_team_users (id);

ALTER TABLE profiles
  ADD CONSTRAINT FK_genders_ENUM_TO_profiles
    FOREIGN KEY (gender)
    REFERENCES genders_ENUM  (gender);
