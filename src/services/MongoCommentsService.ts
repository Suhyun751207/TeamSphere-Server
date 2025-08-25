import { MongoCommentsModel, MongoCommentsDocument } from '@models/MongoComments.ts';
import { MongoCommentsCreate, MongoCommentsUpdate } from '@interfaces/MongoComments.ts';

async function read(): Promise<MongoCommentsDocument[]>;
async function read(id: number): Promise<MongoCommentsDocument | null>;
async function read(id?: number): Promise<MongoCommentsDocument[] | MongoCommentsDocument | null> {
  if (!id) return await MongoCommentsModel.find().sort({ created_at: -1 });
  return await MongoCommentsModel.findOne({ id });
}

async function readId(id: number): Promise<MongoCommentsDocument[] | null> {
  return await MongoCommentsModel.findOne({ id });
}

async function readMemberId(id: number): Promise<MongoCommentsDocument | null> {
  return await MongoCommentsModel.findOne({ member_id: id });
}

async function readByTaskId(task_id: number): Promise<MongoCommentsDocument[]> {
  return await MongoCommentsModel.find({ task_id }).sort({ created_at: -1 });
  // sort 내림차순(DESC)
}

async function readReplies(parent_id: number): Promise<MongoCommentsDocument[]> {
  return await MongoCommentsModel.find({ parent_id }).sort({ created_at: 1 });
  // sort 오름차순(ASC)
}

async function create(data: MongoCommentsCreate): Promise<MongoCommentsDocument> {
  const comment = new MongoCommentsModel(data);
  return await comment.save();
}

async function update(id: number, data: MongoCommentsUpdate): Promise<MongoCommentsDocument | null> {
  return await MongoCommentsModel.findOneAndUpdate(
    { id },
    { ...data, updated_at: new Date() },
    { new: true, runValidators: true }
  );
}

async function _delete(id: number): Promise<boolean> {
  const result = await MongoCommentsModel.findOneAndDelete({ id });
  return result !== null;
}

const mongoCommentsService = {
  read,
  readId,
  readMemberId,
  readByTaskId,
  readReplies,
  create,
  update,
  delete: _delete,
}

export default mongoCommentsService;
