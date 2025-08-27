import { Router, Request, Response } from 'express';
import { MongoRoomsService } from '@services/MongoRoomsService';
import { MongoMessagesService } from '@services/MongoMessagesService';
import { isCreateMongoRoomsRequest, isUpdateMongoRoomsRequest } from '@interfaces/guard/MongoRooms.guard';
import { isCreateMongoMessagesRequest, isUpdateMongoMessagesRequest } from '@interfaces/guard/MongoMessages.guard';
import { authenticateToken } from '@middleware/auth';
import workspacesService from '@services/workspaces';
import workspacesMembersService from '@services/workspacesMembers';
import { ObjectId } from 'mongodb';

const WorkspaceMessageRouter = Router({ mergeParams: true });
const roomsService = new MongoRoomsService();
const messagesService = new MongoMessagesService();

export default WorkspaceMessageRouter;
