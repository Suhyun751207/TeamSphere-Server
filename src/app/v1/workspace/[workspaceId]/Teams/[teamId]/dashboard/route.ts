import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamMember } from "@middleware/workspaceAuth.ts";
import workspaceTeamService from "@services/workspaceTeams";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers";
import workspaceMemberService from "@services/workspacesMembers";
import profilesService from "@services/Profiles";
import roomUserService from "@services/RoomsUser";
import roomsService from "@services/Rooms";
import tasksService from "@services/Tasks";

const teamDashboardRouter = Router({ mergeParams: true });

teamDashboardRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const teamId = req.params.teamId;
    const userId = req.user?.userId;

    const team = await workspaceTeamService.readId(Number(teamId));
    const teamMember = await workspaceTeamUsersService.readByTeamId(Number(teamId));

    const teamMembersWithDetails = await Promise.all(
        teamMember.map(async (member) => {
            const workspaceMember = await workspaceMemberService.readById(member.memberId);

            let profile = null;
            if (workspaceMember && workspaceMember.length > 0) {
                profile = await profilesService.readById(workspaceMember[0].userId);
            }

            return {
                ...member,
                workspaceMember: workspaceMember?.[0] || null,
                profile: profile || null
            };
        })
    );

    const userRooms = await roomUserService.readByUserId(Number(userId));
    const teamRooms = await Promise.all(
        (userRooms || []).map(async (userRoom) => {
            const room = await roomsService.readIdPatch(userRoom.roomId);
            if (room[0].type === "TEAM" &&
                room[0].workspaceId === Number(workspaceId) &&
                room[0].teamId === Number(teamId)) {
                return {
                    ...userRoom,
                    room
                };
            }
            return null;
        })
    );
    const filteredRooms = teamRooms.filter(room => room !== null);

    const tasks = await tasksService.readByTeamId(Number(teamId));

    return res.status(200).json({
        team,
        teamMembers: teamMembersWithDetails,
        teamRooms: filteredRooms,
        tasks
    });

}));

export default teamDashboardRouter;    