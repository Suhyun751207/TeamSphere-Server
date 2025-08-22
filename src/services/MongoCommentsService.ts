import { MongoCommentsModel, MongoCommentsDocument } from '@models/MongoComments.ts';
import { MongoCommentsCreate, MongoCommentsUpdate } from '@interfaces/MongoComments.ts';

async function read(): Promise<MongoCommentsDocument[]>;
async function read(id: string): Promise<MongoCommentsDocument | null>;
async function read(id?: string): Promise<MongoCommentsDocument[] | MongoCommentsDocument | null> {
  if (!id) return await MongoCommentsModel.find().sort({ createdAt: -1 });
  return await MongoCommentsModel.findById(id);
}

async function create(data: MongoCommentsCreate): Promise<MongoCommentsDocument> {
  const comment = new MongoCommentsModel({
    ...data,
    isEdited: false
  });
  return await comment.save();
}

async function update(id: string, data: MongoCommentsUpdate): Promise<MongoCommentsDocument | null> {
  return await MongoCommentsModel.findByIdAndUpdate(
    id,
    { ...data, updatedAt: new Date() },
    { new: true, runValidators: true }
  );
}

async function _delete(id: string): Promise<MongoCommentsDocument | null> {
  return await MongoCommentsModel.findByIdAndDelete(id);
}

const mongoCommentsService = {
  read,
  create,
  update,
  delete: _delete,
}

export default mongoCommentsService;
