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
    // 현재 시간을 한국 시간으로 변환
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000; // KST는 UTC+9
    const kstTime = new Date(now.getTime() + kstOffset + (now.getTimezoneOffset() * 60 * 1000));
    
    // 한국 시간 기준으로 오늘의 시작과 끝 (UTC)
    const kstYear = kstTime.getFullYear();
    const kstMonth = kstTime.getMonth();
    const kstDate = kstTime.getDate();
    
    // 한국 시간으로 자정 기준 UTC 시간 계산
    const kstStart = new Date(Date.UTC(kstYear, kstMonth, kstDate, 0, 0, 0) - kstOffset);
    const kstEnd = new Date(Date.UTC(kstYear, kstMonth, kstDate + 1, 0, 0, 0) - kstOffset);
    
    // 모든 출석체크 기록 가져오기
    const allAttendance = await repo.select({ userId: userId });
    
    if (!Array.isArray(allAttendance)) {
      return false;
    }
    
    // 오늘 날짜의 출석체크 기록 필터링
    const todayAttendance = allAttendance.filter(record => {
      const recordDate = new Date(record.createdAt.getTime() + 9*60*60*1000);
      return recordDate >= kstStart && recordDate < kstEnd;
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