import { repository, ResultSetHeader } from "mysql2-wizard";
import { Rooms, RoomsAutoSetKeys, RoomsCreate, roomsKeys } from "../interfaces/Rooms.ts";

const repo =repository<Rooms, RoomsAutoSetKeys>({
  table: 'TeamSphere.rooms',
  keys: roomsKeys,
  // printQuery: true
});


async function read(): Promise<Rooms[]>;
async function read(id:number): Promise<Rooms|undefined>;
async function read(id?:number ): Promise<Rooms[]|Rooms|undefined>{
  if(!id) return repo.select();
  return repo.select({id})
}

async function readIdPatch(id:number): Promise<Rooms[]>{
  const rows = await repo.select({ id });
  return rows;
}

async function readById(id: number): Promise<Rooms[] | undefined> {
  const rows = await repo.select({ id });
  return rows;
}

async function create(data:RoomsCreate): Promise<ResultSetHeader>{
  return repo.insert([data]);
};

async function update(id:number,data:RoomsCreate):Promise<ResultSetHeader>{
  return repo.update([[{id},data]])
}

async function _delete(id:number):Promise<ResultSetHeader>{
  return repo.delete([{id}])
}


const roomsService={
  read,
  readById,
  readIdPatch,
  create,
  update,
  delete: _delete,
}

export default roomsService;