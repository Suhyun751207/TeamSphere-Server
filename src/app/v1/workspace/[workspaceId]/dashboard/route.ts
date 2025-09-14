import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import { isWorkspaceCreate } from "@interfaces/guard/workspaces.guard";
import workspaceService from "@services/workspaces";
import { authenticateToken } from "@middleware/auth";
import { checkWorkspaceAccess, checkWorkspaceAdminOrManager } from "@middleware/workspaceAuth";
import workspaceMemberService from "@services/workspacesMembers";
import workspaceTeamService from "@services/workspaceTeams";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers";
import tasksService from "@services/Tasks";
import profilesService from "@services/Profiles";
import attendanceRecordsService from "@services/AttendanceRecords";

const DashboardWorkspaceIdRouter = Router({ mergeParams: true });

DashboardWorkspaceIdRouter.get("/", authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const workspace = await workspaceService.read(Number(workspaceId));
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });
    
    const workspaceMember = await workspaceMemberService.read(Number(workspaceId));
    const workspaceTeam = await workspaceTeamService.readByWorkspaceId(Number(workspaceId));
    
    // Get member profiles and attendance records
    const memberProfiles = [];
    const memberAttendance = [];
    
    // Get team details with members and tasks
    const teamDetails = [];
    const workspaceTasks = [];
    
    if (Array.isArray(workspaceMember)) {
        for (const member of workspaceMember) {
            try {
                // Get profile for each member
                const profile = await profilesService.read(member.userId);
                if (profile) {
                    memberProfiles.push({
                        userId: member.userId,
                        memberId: member.id,
                        role: member.role,
                        profile: profile
                    });
                }
                
                // Get attendance records for each member
                const attendance = await attendanceRecordsService.readUserId(member.userId);
                if (attendance) {
                    memberAttendance.push({
                        userId: member.userId,
                        memberId: member.id,
                        attendanceRecords: attendance
                    });
                }
            } catch (error) {
                console.error(`Error fetching data for user ${member.userId}:`, error);
            }
        }
    }
    
    // Get team details with members and tasks
    if (Array.isArray(workspaceTeam)) {
        for (const team of workspaceTeam) {
            try {
                // Get team members
                const teamMembers = await workspaceTeamUsersService.readByTeamId(team.id);
                
                // Get tasks for each team member
                const teamTasks = [];
                if (Array.isArray(teamMembers)) {
                    for (const teamMember of teamMembers) {
                        const memberTasks = await tasksService.read(teamMember.id);
                        if (Array.isArray(memberTasks)) {
                            teamTasks.push(...memberTasks);
                        } else if (memberTasks) {
                            teamTasks.push(memberTasks);
                        }
                    }
                }
                
                teamDetails.push({
                    team: team,
                    members: teamMembers,
                    tasks: teamTasks
                });
                
                // Add tasks to workspace tasks array
                workspaceTasks.push(...teamTasks);
                
            } catch (error) {
                console.error(`Error fetching team details for team ${team.id}:`, error);
            }
        }
    }
    
    return res.status(200).json({
        workspace, 
        workspaceMember, 
        workspaceTeam,
        memberProfiles,
        memberAttendance,
        teamDetails,
        workspaceTasks
    });
}));

export default DashboardWorkspaceIdRouter;
