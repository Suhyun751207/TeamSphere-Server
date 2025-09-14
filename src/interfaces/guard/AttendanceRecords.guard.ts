import { createTypeGuard } from "type-wizard";
import { AttendanceRecordsCreate } from "../AttendanceRecords";

export const isAttendanceRecordsCreate = createTypeGuard<AttendanceRecordsCreate>({
    userId: { type: "number" },
})