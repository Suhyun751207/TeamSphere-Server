import { Router } from "express";
import taskRouter from "./task/route";
import { authenticateToken } from "@middleware/auth";
import { checkTeamMember } from "@middleware/workspaceAuth";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers";
import { TaskState } from "@services/ENUM/task_states_enum";
import { TaskPriority } from "@services/ENUM/task_priority_enum";
import { isTasksCreate } from "@interfaces/guard/Tasks.guard";
import tasksService from "@services/Tasks";

const tasksIdRouter = Router({ mergeParams: true });

tasksIdRouter.use('/task', taskRouter);

// :id로 task를 select를 할 필요가 없음

tasksIdRouter.patch('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const taskId = Number(req.params.taskId);

    const state: TaskState = req.body.state;
    const priority: TaskPriority = req.body.priority;
    const task: string | null = req.body.task || null;
    const data = { state, priority, task };
    if (!isTasksCreate(data)) return res.status(400).json({ message: isTasksCreate.message(data) });

    const result = await tasksService.update(taskId, data);
    return res.status(200).json(result);
}));

export default tasksIdRouter;