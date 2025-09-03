export const AttendanceRecordsKeys = ['id','userId','createdAt'] as const;
export interface AttendanceRecords {
    id: number;
    userId: number;
    createdAt: Date;
}

export type AttendanceRecordsAutoSetKeys = "id" | "createdAt"
export interface AttendanceRecordsCreate extends Omit<AttendanceRecords, AttendanceRecordsAutoSetKeys> { };
export interface AttendanceRecordsUpdate extends Partial<AttendanceRecordsCreate> { }; 