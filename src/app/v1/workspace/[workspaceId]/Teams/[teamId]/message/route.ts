import { Router, Request, Response } from 'express';
import { MongoRoomsService } from '@services/MongoRoomsService';
import { MongoMessagesService } from '@services/MongoMessagesService';
import { isCreateMongoRoomsRequest, isUpdateMongoRoomsRequest } from '@interfaces/guard/MongoRooms.guard';
import { isCreateMongoMessagesRequest, isUpdateMongoMessagesRequest } from '@interfaces/guard/MongoMessages.guard';
import { authenticateToken } from '@middleware/auth';
import workspaceTeamsService from '@services/workspaceTeams';
import workspaceTeamUsersService from '@services/WorkspaceTeamUsers';
import { ObjectId } from 'mongodb';

const TeamMessageRouter = Router({ mergeParams: true });
const roomsService = new MongoRoomsService();
const messagesService = new MongoMessagesService();


export default TeamMessageRouter;
