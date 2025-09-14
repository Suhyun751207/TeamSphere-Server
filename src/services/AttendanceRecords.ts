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
  create,
  update,
  delete: _delete,
}

export default attendanceRecordsService;