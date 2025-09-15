import { repository, ResultSetHeader } from "mysql2-wizard";
import { AttendanceRecords, AttendanceRecordsAutoSetKeys, AttendanceRecordsCreate, AttendanceRecordsKeys } from "../interfaces/AttendanceRecords";

const repo =repository<AttendanceRecords, AttendanceRecordsAutoSetKeys>({
  table: 'TeamSphere.attendance_records',
  keys: AttendanceRecordsKeys,
  // printQuery: true
});


async function read(): Promise<AttendanceRecords[]>;
async function read(id:number): Promise<AttendanceRecords|undefined>;
async function read(id?:number ): Promise<AttendanceRecords[]|AttendanceRecords|undefined>{
  if(!id) return repo.select();
  return repo.select({id})
}

async function readId(id:number): Promise<AttendanceRecords>{
  const res = await repo.select({id})
  return res[0]
}

async function readUserId(id:number): Promise<AttendanceRecords[]|undefined>{
  if(!id) return repo.select();
  return repo.select({userId: id})
}

async function checkTodayAttendance(userId: number): Promise<boolean> {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    // 모든 출석체크 기록을 가져와서 필터링
    const allAttendance = await repo.select({ userId: userId });
    
    if (!Array.isArray(allAttendance)) {
      return false;
    }
    
    // 오늘 날짜의 출석체크 기록 필터링
    const todayAttendance = allAttendance.filter(record => {
      const recordDate = new Date(record.createdAt);
      return recordDate >= todayStart && recordDate < todayEnd;
    });
    
    return todayAttendance.length > 0;
  } catch (error) {
    console.error('오늘 출석체크 확인 오류:', error);
    return false;
  }
}

async function create(data:AttendanceRecordsCreate): Promise<ResultSetHeader>{
  return repo.insert([data]);
};

async function update(id:number,data:Partial<AttendanceRecordsCreate>):Promise<ResultSetHeader>{
  return repo.update([[{id},data]])
}

async function _delete(id:number):Promise<ResultSetHeader>{
  return repo.delete([{id}])
}

const attendanceRecordsService={
  read,
  readId,
  readUserId,
  checkTodayAttendance,
  create,
  update,
  delete: _delete,
}

export default attendanceRecordsService;