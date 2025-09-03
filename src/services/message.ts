import { repository, ResultSetHeader } from "mysql2-wizard";
import { messageKeys, Message, MessageAutoSetKeys, MessageCreate } from "../interfaces/message.ts";

const repo =repository<Message, MessageAutoSetKeys>({
  table: 'TeamSphere.message',
  keys: messageKeys,
  // printQuery: true
});


async function read(): Promise<Message[]>;
async function read(id:number): Promise<Message|undefined>;
async function read(id?:number ): Promise<Message[]|Message|undefined>{
  if(!id) return repo.select();
  return repo.select({id})
}

async function readId(id:number): Promise<Message>{
  const res = await repo.select({id})
  return res[0]
}

async function readRoomIdMessage(id:number): Promise<Message[]|undefined>{
  if(!id) return repo.select();
  return repo.select({roomId: id})
}

async function create(data:MessageCreate): Promise<ResultSetHeader>{
  return repo.insert([data]);
};

async function update(id:number,data:Partial<MessageCreate>):Promise<ResultSetHeader>{
  return repo.update([[{id},data]])
}

async function _delete(id:number):Promise<ResultSetHeader>{
  return repo.delete([{id}])
}

const messageService={
  read,
  readId,
  readRoomIdMessage,
  create,
  update,
  delete: _delete,
}

export default messageService;