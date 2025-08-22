import { createTypeGuard } from "type-wizard";
import { tasksCreate } from "../Tasks.ts";

export const isTasksCreate=createTypeGuard<tasksCreate>({
    teamMemberId: {type: "number"},
    externalId: {type: "string", nullable: true},
    state: {type: "string"},
    priority: {type: "string"},
    task: {type: "string", nullable: true},
}).optional();
