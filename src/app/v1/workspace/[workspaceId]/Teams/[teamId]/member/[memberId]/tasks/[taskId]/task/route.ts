import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamAdminOrManager, checkTeamMember } from "@middleware/workspaceAuth.ts";
import mongoTaskService from "@services/MongoTaskService.ts";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers.ts";
import { isMongoTaskCreate, isMongoTaskUpdate } from "@interfaces/guard/MongoTask.guard.ts";

import { task_priority_enum } from "@services/ENUM/task_priority_enum.ts";
import { task_states_enum } from "@services/ENUM/task_states_enum.ts";

import mongoTaskIdRouter from "./[taskId]/route.ts";

const mongoTaskRouter = Router({ mergeParams: true });
mongoTaskRouter.use('/:taskId', mongoTaskIdRouter);

// GET - MongoDB Task 조회
mongoTaskRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { teamId, memberId, taskId } = req.params;

    // 기존 MySQL taskId를 통해 연관된 MongoDB Task들을 조회
    const results = await workspaceTeamUsersService.readMemberIdAndTeamId(Number(memberId), Number(teamId));
    if (!results || results.length === 0) {
        return res.status(400).json({ message: "팀 정보를 찾을 수 없습니다" });
    }

    const workspaceTeamUserId = results[0].id;

    // MongoDB Task 전체 조회 후 필터링
    const allTasks = await mongoTaskService.read();
    const filteredTasks = Array.isArray(allTasks) ?
        allTasks.filter(task => task.workspaceTeamUserId === workspaceTeamUserId) : [];

    return res.status(200).json(filteredTasks);
}));

// POST - MongoDB Task 생성
mongoTaskRouter.post('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { teamId, memberId } = req.params;
    const { title, description, state, priority, dueDate, tags, assignees, attachments } = req.body;

    const teamInfo = await workspaceTeamUsersService.readMemberIdAndTeamId(Number(memberId), Number(teamId));
    if (!teamInfo || teamInfo.length === 0) {
        return res.status(400).json({ message: "MongoDB Task 생성 실패 - 팀 정보 없음" });
    }

    const workspaceTeamUserId = teamInfo[0].id;

    const taskData = {
        workspaceTeamUserId,
        title,
        description: description || null,
        state: state || task_states_enum[2],
        priority: priority || task_priority_enum[2],
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || [],
        assignees: assignees || [],
        attachments: attachments || []
    };

    if (!isMongoTaskCreate(taskData)) {
        return res.status(400).json({
            message: "유효하지 않은 MongoDB Task 데이터",
            errors: isMongoTaskCreate.message(taskData)
        });
    }

    const result = await mongoTaskService.create(taskData);
    return res.status(201).json(result);
}));


export default mongoTaskRouter;
