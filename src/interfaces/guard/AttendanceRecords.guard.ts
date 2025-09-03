import { createTypeGuard } from "type-wizard";
import { AttendanceRecordsCreate } from "../AttendanceRecords.ts";

export const isAttendanceRecordsCreate = createTypeGuard<AttendanceRecordsCreate>({
    userId: { type: "number" },
})