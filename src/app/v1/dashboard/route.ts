import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import mongoTaskService from "@services/MongoTaskService";
import userService from "@services/Users";
import profilesService from "@services/Profiles";
import activityLogsService from "@services/ActivityLogs";
import { authenticateToken } from "@middleware/auth";
import attendanceRecordsService from "@services/AttendanceRecords";
import roomsService from "@services/Rooms";
import roomUserService from "@services/RoomsUser";
import workspaceMemberService from "@services/workspacesMembers";
import workspaceService from "@services/workspaces";
const dashboardRouter = Router();

/**
 * @swagger
 * /v1/dashboard:
 *   get:
 *     summary: 사용자 대시보드 데이터 조회
 *     description: 인증된 사용자의 대시보드에 필요한 모든 데이터를 조회합니다.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 대시보드 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                   description: 사용자 기본 정보
 *                 profile:
 *                   $ref: '#/components/schemas/Profile'
 *                   description: 사용자 프로필 정보
 *                 activityLog:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivityLog'
 *                   description: 사용자 활동 로그 목록
 *                 attendanceRecords:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AttendanceRecord'
 *                   description: 출석 기록 목록
 *                 rooms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
 *                   description: 참여 중인 채팅방 목록
 *                 workspaces:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Workspace'
 *                   description: 참여 중인 워크스페이스 목록
 *       400:
 *         description: 필수 데이터를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User or Profile or ActivityLog or AttendanceRecords or Rooms or Workspaces not found"
 *       401:
 *         description: 인증되지 않은 사용자
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
dashboardRouter.get("/", authenticateToken, catchAsyncErrors(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await userService.readById(userId);
    const profile = await profilesService.readById(userId);
    const activityLog = await activityLogsService.readByUserId(userId)
    const attendanceRecords = await attendanceRecordsService.readUserId(userId)
    const roomUser = await roomUserService.readByUserId(userId)
    let rooms;
    if (roomUser) {
        const roomIds = roomUser.map(item => item.roomId);
        rooms = await Promise.all(
            roomIds.map(id => roomsService.readById(id))
        );
    };
    let workspaces;
    const workspaceMember = await workspaceMemberService.readByUserId(userId);
    if (workspaceMember) {
        const workspaceIds = workspaceMember.map(item => item.workspaceId);
        workspaces = await Promise.all(
            workspaceIds.map(id => workspaceService.read(id))
        );
    };

    if (!user || !profile || !activityLog || !attendanceRecords || !rooms || !workspaces) return res.status(400).json({ message: "User or Profile or ActivityLog or AttendanceRecords or Rooms or Workspaces not found" });
    const data = {
        user,
        profile,
        activityLog,
        attendanceRecords,
        rooms,
        workspaces,
    }
    return res.status(200).json(data);
}));

export default dashboardRouter;