import { repository, ResultSetHeader } from "mysql2-wizard";
import { RoomUser, RoomUserAutoSetKeys, RoomUserCreate, roomUserKeys } from "../interfaces/RoomUser.ts";

const repo =repository<RoomUser, RoomUserAutoSetKeys>({
  table: 'TeamSphere.room_user',
  keys: roomUserKeys,
  // printQuery: true
});


async function read(): Promise<RoomUser[]>;
async function read(id:number): Promise<RoomUser|undefined>;
async function read(id?:number ): Promise<RoomUser[]|RoomUser|undefined>{
  if(!id) return repo.select();
  return repo.select({id})
}

async function readById(id: number): Promise<RoomUser | undefined> {
  const rows = await repo.select({ id });
  return rows[0];
} 

async function readId(id: number): Promise<RoomUser[] | undefined> {
  const rows = await repo.select({ roomId: id });
  return rows;
} 

async function readByUserId(id: number): Promise<RoomUser[] | undefined> {
  const rows = await repo.select({ userId: id });
  return rows;
}

async function create(data:RoomUserCreate): Promise<ResultSetHeader>{
  return repo.insert([data]);
};

async function update(id:number,data:RoomUserCreate):Promise<ResultSetHeader>{
  return repo.update([[{id},data]])
}

async function _delete(id:number):Promise<ResultSetHeader>{
  return repo.delete([{id}])
}

async function deleteByRoomIdAndUserId(roomId: number, userId: number): Promise<ResultSetHeader> {
  return repo.delete([{roomId, userId}]);
}


const roomUserService={
  read,
  readById,
  readId,
  readByUserId,
  create,
  update,
  delete: _delete,
  deleteByRoomIdAndUserId,
}

export default roomUserService;