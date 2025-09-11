import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import { checkTeamMember } from "@middleware/workspaceAuth.ts";
import workspaceTeamService from "@services/workspaceTeams.ts";
import workspaceTeamUsersService from "@services/WorkspaceTeamUsers.ts";
import workspacesMembers from "@services/workspacesMembers.ts";
import MongoTaskService from "@services/MongoTaskService.ts";
import MongoCommentsService from "@services/MongoCommentsService.ts";
import profilesService from "@services/Profiles.ts";
import tasksService from "@services/Tasks.ts";

const teamDashboardRouter = Router({ mergeParams: true });

teamDashboardRouter.get('/', authenticateToken, checkTeamMember, catchAsyncErrors(async (req, res) => {
    const { workspaceId, teamId } = req.params;
    const teamIdNum = Number(teamId);

    try {
        // 1. 팀 기본 정보 조회
        const teamInfo = await workspaceTeamService.readId(teamIdNum);
        if (!teamInfo) {
            return res.status(404).json({ message: "Team not found" });
        }

        // 2. 팀 멤버 정보 조회
        const teamMembers = await workspaceTeamUsersService.readByTeamId(teamIdNum);

        // 3. 각 멤버별 상세 정보 조회 (member/[memberId] route의 GET / 로직 실행)
        const memberDetails = await Promise.all(
            teamMembers.map(async (member) => {
                // member/[memberId] route 로직
                const memberDetailResult = await workspaceTeamUsersService.readIdAndTeamId(member.id, teamIdNum);
                const memberDetailWithUserInfo = await Promise.all(
                    memberDetailResult.map(async (teamMember) => {
                        const workspaceMember = await workspacesMembers.readById(teamMember.memberId);
                        const userId = workspaceMember[0]?.userId;
                        const profile = await profilesService.read(userId);
                        return {
                            ...teamMember,
                            workspaceMember: workspaceMember[0] || null,
                            profile: profile || null
                        };
                    })
                );

                // member/[memberId]/tasks route 로직 - 멤버의 작업 목록 조회
                const memberTasksResult = await workspaceTeamUsersService.readMemberIdAndTeamId(member.id, teamIdNum);
                const memberWorkspaceId = memberTasksResult[0]?.id;
                const memberMysqlTasks = memberWorkspaceId ? await tasksService.read(memberWorkspaceId) : [];

                return {
                    memberInfo: memberDetailWithUserInfo[0] || null,
                    tasks: memberMysqlTasks || [],
                    memberId: member.id,
                    teamId: teamIdNum
                };
            })
        );

        // 4. 팀 멤버들의 workspaceTeamUserId 수집
        const teamUserIds = teamMembers.map(member => member.id);

        // 5. 전체 MongoDB 작업 통계 조회
        const allMongoTasks = await MongoTaskService.getTasksByTeamUserIds(teamUserIds);

        // 5. 각 멤버의 작업별 상세 정보 조회 (tasks/[taskId] route 로직 실행)
        const memberTaskDetails = await Promise.all(
            memberDetails.map(async (member) => {
                const tasks = Array.isArray(member.tasks) ? member.tasks : [];
                const taskDetails = await Promise.all(
                    tasks.map(async (task: any) => {
                        // MongoDB 작업 조회 (task/[taskId] route 로직)
                        const mongoTasks = await MongoTaskService.getTasksByTeamUserIds([member.memberId]);
                        const relatedMongoTask = mongoTasks.find((mt: any) => mt.task_id === task.id);

                        // 댓글 조회 (comments route 로직)
                        const taskComments = relatedMongoTask ?
                            await MongoCommentsService.readByTaskId(relatedMongoTask.id) : [];

                        return {
                            mysqlTask: task,
                            mongoTask: relatedMongoTask || null,
                            comments: taskComments
                        };
                    })
                );

                return {
                    memberInfo: member.memberInfo,
                    memberId: member.memberId,
                    teamId: member.teamId,
                    tasks: member.tasks,
                    taskDetails
                };
            })
        );

        // 6. 전체 작업 데이터 수집
        const allMysqlTasks = memberDetails.flatMap(member => Array.isArray(member.tasks) ? member.tasks : []);
        const allMongoTasksFromMembers = memberTaskDetails.flatMap(member =>
            member.taskDetails.map((td: any) => td.mongoTask).filter(Boolean)
        );
        const allCommentsFromMembers = memberTaskDetails.flatMap(member =>
            member.taskDetails.flatMap((td: any) => td.comments)
        );

        // 7. MongoDB 작업 상태별 통계
        const mongoTaskStats = {
            total: allMongoTasks.length,
            pending: allMongoTasks.filter((task: any) => task.status === 'PENDING').length,
            inProgress: allMongoTasks.filter((task: any) => task.status === 'IN_PROGRESS').length,
            completed: allMongoTasks.filter((task: any) => task.status === 'COMPLETED').length,
            cancelled: allMongoTasks.filter((task: any) => task.status === 'CANCELLED').length
        };

        // 8. MongoDB 우선순위별 통계
        const mongoPriorityStats = {
            low: allMongoTasks.filter((task: any) => task.priority === 'LOW').length,
            medium: allMongoTasks.filter((task: any) => task.priority === 'MEDIUM').length,
            high: allMongoTasks.filter((task: any) => task.priority === 'HIGH').length,
            urgent: allMongoTasks.filter((task: any) => task.priority === 'URGENT').length
        };

        // 9. MySQL 작업 상태별 통계
        const mysqlTaskStats = {
            total: allMysqlTasks.length,
            todo: allMysqlTasks.filter((task: any) => task.state === 'TODO').length,
            inProgress: allMysqlTasks.filter((task: any) => task.state === 'IN_PROGRESS').length,
            done: allMysqlTasks.filter((task: any) => task.state === 'DONE').length,
            cancelled: allMysqlTasks.filter((task: any) => task.state === 'CANCELLED').length
        };

        // 10. 댓글 통계 (실제 member route에서 수집된 데이터 사용)
        const commentStats = {
            total: allCommentsFromMembers.length,
            byMember: teamUserIds.map((teamUserId: any) => ({
                memberId: teamUserId,
                count: allCommentsFromMembers.filter((comment: any) => comment.workspace_team_user_id === teamUserId).length
            }))
        };

        // 11. 최근 활동 (최근 생성된 작업 및 댓글)
        const recentMongoTasks = allMongoTasks
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);

        const recentComments = allCommentsFromMembers
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);

        const recentMysqlTasks = allMysqlTasks
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);

        // 12. 사용 가능한 모든 라우트 정보
        const availableRoutes = {
            memberRoutes: memberTaskDetails.map(member => ({
                memberId: member.memberId,
                memberInfo: member.memberInfo,
                taskDetails: member.taskDetails
            }))
        };

        // 13. 응답 데이터 구성
        const dashboardData = {
            team: teamInfo,
            members: memberTaskDetails,
            statistics: {
                memberCount: teamMembers.length,
                tasks: {
                    mongo: mongoTaskStats,
                    mysql: mysqlTaskStats
                },
                comments: commentStats
            },
            recentActivity: {
                mongoTasks: recentMongoTasks,
                mysqlTasks: recentMysqlTasks,
                comments: recentComments
            },
            routes: availableRoutes,
            summary: {
                totalTasks: mongoTaskStats.total + mysqlTaskStats.total,
                completionRate: (mongoTaskStats.total + mysqlTaskStats.total) > 0 ?
                    Math.round(((mongoTaskStats.completed + mysqlTaskStats.done) / (mongoTaskStats.total + mysqlTaskStats.total)) * 100) : 0,
                totalComments: commentStats.total,
                activeMembers: memberTaskDetails.filter(member =>
                    Array.isArray(member.tasks) && member.tasks.length > 0
                ).length
            }
        };
        return res.status(200).json(dashboardData);

    } catch (error) {
        console.error('Team dashboard error:', error);
        return res.status(500).json({
            message: "Failed to load team dashboard data",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));

export default teamDashboardRouter;    