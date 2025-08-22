import { MongoTaskModel, MongoTaskDocument } from '@models/MongoTask.ts';
import { MongoTaskCreate, MongoTaskUpdate } from '@interfaces/MongoTask.ts';

async function read(): Promise<MongoTaskDocument[]>;
async function read(id: string): Promise<MongoTaskDocument | null>;
async function read(id?: string): Promise<MongoTaskDocument[] | MongoTaskDocument | null> {
  if (!id) return await MongoTaskModel.find().sort({ createdAt: -1 });
  return await MongoTaskModel.findById(id);
}

async function create(data: MongoTaskCreate): Promise<MongoTaskDocument> {
  const task = new MongoTaskModel(data);
  return await task.save();
}

async function update(id: string, data: MongoTaskUpdate): Promise<MongoTaskDocument | null> {
  return await MongoTaskModel.findByIdAndUpdate(
    id,
    { ...data, updatedAt: new Date() },
    { new: true, runValidators: true }
  );
}

async function _delete(id: string): Promise<MongoTaskDocument | null> {
  return await MongoTaskModel.findByIdAndDelete(id);
}

const mongoTaskService = {
  read,
  create,
  update,
  delete: _delete,
}

export default mongoTaskService;
