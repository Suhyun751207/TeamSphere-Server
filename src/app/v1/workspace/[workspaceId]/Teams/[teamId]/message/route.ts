import { Router, Request, Response } from 'express';
import { authenticateToken } from '@middleware/auth';
import workspaceTeamsService from '@services/workspaceTeams';
import workspaceTeamUsersService from '@services/WorkspaceTeamUsers';
import { ObjectId } from 'mongodb';

const TeamMessageRouter = Router({ mergeParams: true });


export default TeamMessageRouter;
