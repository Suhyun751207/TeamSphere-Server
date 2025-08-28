import { Router, Request, Response } from 'express';
import { authenticateToken } from '@middleware/auth';
import workspacesService from '@services/workspaces';
import workspacesMembersService from '@services/workspacesMembers';
import { ObjectId } from 'mongodb';

const WorkspaceMessageRouter = Router({ mergeParams: true });

export default WorkspaceMessageRouter;
