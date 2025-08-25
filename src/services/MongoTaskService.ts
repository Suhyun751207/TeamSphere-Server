import { MongoTaskModel, MongoTaskDocument } from '@models/MongoTask.ts';
import { MongoTaskCreate, MongoTaskUpdate } from '@interfaces/MongoTask.ts';

async function read(): Promise<MongoTaskDocument[]>;
async function read(id: number): Promise<MongoTaskDocument | null>;
async function read(id?: number): Promise<MongoTaskDocument[] | MongoTaskDocument | null> {
  if (!id) return await MongoTaskModel.find().sort({ created_at: -1 });
  return await MongoTaskModel.findOne({ id });
}

async function readByTaskId(task_id: number): Promise<MongoTaskDocument[]> {
  return await MongoTaskModel.find({ task_id }).sort({ created_at: -1 });
}

async function create(data: MongoTaskCreate): Promise<MongoTaskDocument> {
  const task = new MongoTaskModel(data);
  return await task.save();
}

async function update(id: number, data: MongoTaskUpdate): Promise<MongoTaskDocument | null> {
  const result = await MongoTaskModel.findOneAndUpdate(
    { id },
    { ...data, updated_at: new Date() },
    { new: true, runValidators: true }
  ) as unknown as MongoTaskDocument | null;
  return result;
}

async function _delete(id: number): Promise<MongoTaskDocument | null> {
  const result = await MongoTaskModel.findOneAndDelete({ id }) as unknown as MongoTaskDocument | null;
  return result;
}

const mongoTaskService = {
  read,
  readByTaskId,
  create,
  update,
  delete: _delete,
}

export default mongoTaskService;
