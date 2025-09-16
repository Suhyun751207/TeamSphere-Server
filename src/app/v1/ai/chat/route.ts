import { Router, Request, Response } from 'express';
import { processUserMessageWithContext } from '../../../../services/aiService';
import { authenticateToken } from '../../../../middleware/auth';
import workspaceService from '../../../../services/workspaces';
import workspaceMemberService from '../../../../services/workspacesMembers';
import workspaceTeamService from '../../../../services/workspaceTeams';
import workspaceTeamUsersService from '../../../../services/WorkspaceTeamUsers';
import tasksService from '../../../../services/Tasks';
import activityLogsService from '../../../../services/ActivityLogs';
import profilesService from '../../../../services/Profiles';
import attendanceRecordsService from '../../../../services/AttendanceRecords';
import { isWorkspaceCreate } from '../../../../interfaces/guard/workspaces.guard';
import catchAsyncErrors from '../../../../utils/catchAsyncErrors';

const chatRouter = Router();

// 인증 미들웨어 적용
chatRouter.use(authenticateToken);

/**
 * @swagger
 * /v1/ai/chat:
 *   post:
 *     tags: [AI Chat]
 *     summary: AI 챗봇 메시지 처리
 *     description: 사용자의 자연어 메시지를 분석하여 워크스페이스, 팀, 작업 등을 생성하거나 관리합니다.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIChatRequest'
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIChatResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// 챗봇 메시지 처리
chatRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: '메시지가 필요합니다.'
      });
    }

    // AI 처리 (대화 컨텍스트 포함)
    const userId = req.user?.userId || 0;
    const aiResponse = await processUserMessageWithContext(message, userId);
    
    // 활동 로그 기록 함수 (성능 향상을 위한 비동기 처리)
    const logActivity = (workspaceId: number, action: string, details: string) => {
      try {
        // 비동기적으로 활동 로그 기록하여 메인 기능에 영향을 주지 않음
        setImmediate(async () => {
          try {
            await activityLogsService.create({
              userId,
              workspaceId,
              message: `AI 챗봇: ${action} - ${details}`
            });
          } catch (logError) {
            console.error('활동 로그 기록 오류:', logError);
          }
        });
      } catch (error) {
        console.error('활동 로그 스케줄링 오류:', error);
      }
    };
    
    // 액션에 따라 실제 API 호출
    let result = null;
    let workspaceIdForLog = 0;
    let skipActivityLog = false; // 활동로그 기록 건너뛰기 플래그
    
    switch (aiResponse.action) {
      case 'create_workspace':
        try {
          const workspaceData = {
            name: aiResponse.parameters.workspaceName,
            description: `${aiResponse.parameters.workspaceName} 워크스페이스 (AI 생성)`
          };
          
          if (!isWorkspaceCreate(workspaceData)) {
            result = { status: 'error', message: '워크스페이스 이름이 유효하지 않습니다.' };
            break;
          }
          
          const adminId = req.user?.userId;
          const workspaceResult = await workspaceService.create({ ...workspaceData, adminId: adminId! });
          const workspaceMemberResult = await workspaceMemberService.create({ 
            workspaceId: workspaceResult.insertId, 
            userId: adminId!, 
            role: 'Admin' 
          });
          
          workspaceIdForLog = workspaceResult.insertId;
          
          result = { 
            status: 'success', 
            action: 'create_workspace',
            workspace: workspaceResult,
            workspaceMember: workspaceMemberResult
          };
        } catch (error) {
          console.error('워크스페이스 생성 오류:', error);
          result = { status: 'error', message: '워크스페이스 생성 중 오류가 발생했습니다.' };
        }
        break;
      case 'clarification_needed':
        result = { 
          status: 'clarification', 
          action: 'clarification_needed',
          clarificationType: aiResponse.parameters.clarificationType,
          context: aiResponse.parameters
        };
        break;
      case 'create_team':
        try {
          const teamName = aiResponse.parameters.teamName;
          const workspaceName = aiResponse.parameters.workspaceName;
          
          if (!teamName) {
            result = { status: 'error', message: '팀 이름이 필요합니다.' };
            break;
          }
          
          // workspaceName이 제공된 경우 해당 워크스페이스 찾기
          let workspaceId;
          if (workspaceName) {
            const workspaces = await workspaceService.read();
            const targetWorkspace = workspaces.find(w => w.name === workspaceName);
            if (!targetWorkspace) {
              result = { status: 'error', message: `"${workspaceName}" 워크스페이스를 찾을 수 없습니다.` };
              break;
            }
            workspaceId = targetWorkspace.id;
          } else {
            // workspaceName이 없는 경우 사용자의 첫 번째 워크스페이스 사용
            const userWorkspaces = await workspaceService.read();
            if (userWorkspaces.length === 0) {
              result = { status: 'error', message: '팀을 생성할 워크스페이스가 없습니다. 먼저 워크스페이스를 생성해주세요.' };
              break;
            }
            workspaceId = userWorkspaces[0].id;
          }
          
          const adminId = req.user?.userId;
          const teamData = {
            name: teamName,
            workspaceId: workspaceId,
            managerId: adminId!
          };
          
          const teamResult = await workspaceTeamService.create(teamData);
          
          // 팀 생성 후 사용자를 팀 멤버로 Admin 권한으로 추가
          const teamMemberData = {
            memberId: adminId!,
            teamId: teamResult.insertId,
            role: 'Admin' as const
          };
          
          const teamMemberResult = await workspaceTeamUsersService.create(teamMemberData);
          
          workspaceIdForLog = workspaceId;
          
          result = { 
            status: 'success', 
            action: 'create_team',
            team: {
              id: teamResult.insertId,
              name: teamName,
              workspaceId: workspaceId,
              managerId: adminId
            },
            teamMember: {
              id: teamMemberResult.insertId,
              memberId: adminId,
              teamId: teamResult.insertId,
              role: 'Admin'
            }
          };
        } catch (error) {
          console.error('팀 생성 오류:', error);
          result = { status: 'error', message: '팀 생성 중 오류가 발생했습니다.' };
        }
        break;
      case 'create_task':
        try {
          const taskTitle = aiResponse.parameters.taskTitle;
          const workspaceName = aiResponse.parameters.workspaceName;
          
          if (!taskTitle) {
            result = { status: 'error', message: '작업 제목이 필요합니다.' };
            break;
          }
          
          // workspaceName이 제공된 경우 해당 워크스페이스 찾기
          let workspaceId;
          if (workspaceName) {
            const workspaces = await workspaceService.read();
            const targetWorkspace = workspaces.find(w => w.name === workspaceName);
            if (!targetWorkspace) {
              result = { status: 'error', message: `"${workspaceName}" 워크스페이스를 찾을 수 없습니다.` };
              break;
            }
            workspaceId = targetWorkspace.id;
          } else {
            // workspaceName이 없는 경우 사용자의 첫 번째 워크스페이스 사용
            const userWorkspaces = await workspaceService.read();
            if (userWorkspaces.length === 0) {
              result = { status: 'error', message: '작업을 생성할 워크스페이스가 없습니다. 먼저 워크스페이스를 생성해주세요.' };
              break;
            }
            workspaceId = userWorkspaces[0].id;
          }
          
          // 워크스페이스의 팀 찾기
          const teamsResult = await workspaceTeamService.readByWorkspaceId(workspaceId);
          const teams = Array.isArray(teamsResult) ? teamsResult : [teamsResult].filter(Boolean);
          
          if (teams.length === 0) {
            result = { status: 'error', message: '작업을 생성할 팀이 없습니다. 먼저 팀을 생성해주세요.' };
            break;
          }
          
          // 첫 번째 팀 사용 (또는 사용자가 멤버인 팀 찾기)
          const adminId = req.user?.userId;
          let targetTeam = teams[0];
          
          // 사용자가 멤버인 팀 찾기
          for (const team of teams) {
            const teamMembers = await workspaceTeamUsersService.readByTeamId(team.id);
            const userMember = teamMembers.find(m => m.memberId === adminId);
            if (userMember) {
              targetTeam = team;
              break;
            }
          }
          
          // 사용자가 팀 멤버인지 확인
          const teamMembers = await workspaceTeamUsersService.readByTeamId(targetTeam.id);
          const userMember = teamMembers.find(m => m.memberId === adminId);
          
          if (!userMember) {
            // 사용자가 팀 멤버가 아니면 추가
            const newTeamMemberData = {
              memberId: adminId!,
              teamId: targetTeam.id,
              role: 'Member' as const
            };
            await workspaceTeamUsersService.create(newTeamMemberData);
          }
          
          // 작업 생성
          const taskData = {
            teamId: targetTeam.id,
            teamMemberId: adminId!,
            state: 'To Do' as const,
            priority: 'Medium' as const,
            task: taskTitle,
            externalId: null
          };
          
          const taskResult = await tasksService.create(taskData);
          
          workspaceIdForLog = workspaceId;
          
          result = { 
            status: 'success', 
            action: 'create_task',
            task: {
              id: taskResult.insertId,
              teamId: targetTeam.id,
              teamMemberId: adminId,
              state: 'To Do',
              priority: 'Medium',
              task: taskTitle,
              externalId: null
            }
          };
        } catch (error) {
          console.error('작업 생성 오류:', error);
          result = { status: 'error', message: '작업 생성 중 오류가 발생했습니다.' };
        }
        break;
      case 'create_activity_log':
        skipActivityLog = true; // 활동로그 생성 요청은 중복 기록 방지
        try {
          const message = aiResponse.parameters.message;
          const workspaceName = aiResponse.parameters.workspaceName;
          
          if (!message) {
            result = { status: 'error', message: '활동 로그 메시지가 필요합니다.' };
            break;
          }
          
          // workspaceName이 제공된 경우 해당 워크스페이스 찾기
          let workspaceId;
          if (workspaceName) {
            const workspaces = await workspaceService.read();
            const targetWorkspace = workspaces.find(w => w.name === workspaceName);
            if (!targetWorkspace) {
              result = { status: 'error', message: `"${workspaceName}" 워크스페이스를 찾을 수 없습니다.` };
              break;
            }
            workspaceId = targetWorkspace.id;
          } else {
            // workspaceName이 없는 경우 사용자의 첫 번째 워크스페이스 사용
            const userWorkspaces = await workspaceService.read();
            if (userWorkspaces.length === 0) {
              result = { status: 'error', message: '활동 로그를 생성할 워크스페이스가 없습니다. 먼저 워크스페이스를 생성해주세요.' };
              break;
            }
            workspaceId = userWorkspaces[0].id;
          }
          
          // 활동 로그 생성 - 워크스페이스 멤버 ID 찾기
          const workspaceMember = await workspaceMemberService.readByUserIdAndWorkspaceId(userId, workspaceId);
          if (!workspaceMember) {
            result = { status: 'error', message: '해당 워크스페이스의 멤버가 아닙니다.' };
            break;
          }
          
          // 워크스페이스 멤버 ID로 활동 로그 생성
          await activityLogsService.create({
            userId: workspaceMember.id, // 워크스페이스 멤버 ID 사용
            workspaceId,
            message
          });
          
          workspaceIdForLog = workspaceId;
          
          result = { 
            status: 'success', 
            action: 'create_activity_log',
            activityLog: {
              userId: workspaceMember.id, // 워크스페이스 멤버 ID
              workspaceId,
              message
            }
          };
        } catch (error) {
          console.error('활동 로그 생성 오류:', error);
          result = { status: 'error', message: '활동 로그 생성 중 오류가 발생했습니다.' };
        }
        break;
      case 'update_profile':
        try {
          const field = aiResponse.parameters.field;
          const value = aiResponse.parameters.value;
          
          if (!field || !value) {
            result = { status: 'error', message: '프로필 필드와 값이 필요합니다.' };
            break;
          }
          
          // 프로필 업데이트 데이터 생성
          const updateData: any = {};
          
          // 필드 타입에 따라 값 변환
          if (field === 'age') {
            const ageValue = parseInt(value);
            if (isNaN(ageValue)) {
              result = { status: 'error', message: '나이는 숫자로 입력해주세요.' };
              break;
            }
            updateData.age = ageValue;
          } else if (field === 'name') {
            updateData.name = value;
          } else if (field === 'email') {
            updateData.email = value;
          } else {
            result = { status: 'error', message: `지원하지 않는 필드입니다: ${field}` };
            break;
          }
          
          // 프로필 업데이트
          await profilesService.update(userId, updateData);
          
          result = { 
            status: 'success', 
            action: 'update_profile',
            profile: {
              userId,
              field,
              value
            }
          };
        } catch (error) {
          console.error('프로필 업데이트 오류:', error);
          result = { status: 'error', message: '프로필 업데이트 중 오류가 발생했습니다.' };
        }
        break;
      case 'get_teams':
        try {
          const adminId = req.user?.userId;
          
          // 사용자가 속한 워크스페이스 멤버십 조회
          const userWorkspaceMembers = await workspaceMemberService.readByUserId(adminId!);
          
          if (userWorkspaceMembers.length === 0) {
            result = { status: 'success', action: 'get_teams', teams: [] };
            break;
          }
          
          // 사용자가 속한 워크스페이스 ID 목록
          const workspaceIds = userWorkspaceMembers.map(member => member.workspaceId);
          
          // 해당 워크스페이스들의 팀 조회
          const allTeams: any[] = [];
          for (const workspaceId of workspaceIds) {
            const teams = await workspaceTeamService.readByWorkspaceId(workspaceId);
            const teamsArray = Array.isArray(teams) ? teams : [teams].filter(Boolean);
            
            // 각 팀에 대해 사용자가 멤버인지 확인
            for (const team of teamsArray) {
              const teamMembers = await workspaceTeamUsersService.readByTeamId(team.id);
              const userMember = teamMembers.find(m => m.memberId === adminId);
              
              if (userMember) {
                allTeams.push({
                  id: team.id,
                  name: team.name,
                  workspaceId: team.workspaceId,
                  role: userMember.role
                });
              }
            }
          }
          
          result = { 
            status: 'success', 
            action: 'get_teams',
            teams: allTeams
          };
        } catch (error) {
          console.error('팀 조회 오류:', error);
          result = { status: 'error', message: '팀 목록 조회 중 오류가 발생했습니다.' };
        }
        break;
      case 'get_workspaces':
        try {
          const adminId = req.user?.userId;
          
          // 사용자가 속한 워크스페이스 멤버십 조회
          const userWorkspaceMembers = await workspaceMemberService.readByUserId(adminId!);
          
          if (userWorkspaceMembers.length === 0) {
            result = { status: 'success', action: 'get_workspaces', workspaces: [] };
            break;
          }
          
          // 워크스페이스 상세 정보 조회
          const allWorkspaces = await workspaceService.read();
          const userWorkspaces = allWorkspaces.filter(workspace => 
            userWorkspaceMembers.some(member => member.workspaceId === workspace.id)
          );
          
          // 사용자 권한 정보 포함
          const workspacesWithRoles = userWorkspaces.map(workspace => {
            const memberInfo = userWorkspaceMembers.find(member => member.workspaceId === workspace.id);
            return {
              id: workspace.id,
              name: workspace.name,
              description: workspace.description,
              role: memberInfo?.role || 'Member'
            };
          });
          
          result = { 
            status: 'success', 
            action: 'get_workspaces',
            workspaces: workspacesWithRoles
          };
        } catch (error) {
          console.error('워크스페이스 조회 오류:', error);
          result = { status: 'error', message: '워크스페이스 목록 조회 중 오류가 발생했습니다.' };
        }
        break;
      case 'list_teams':
        try {
          const workspaceName = aiResponse.parameters.workspaceName;
          const adminId = req.user?.userId;
          
          if (!workspaceName) {
            result = { status: 'error', message: '워크스페이스 이름이 필요합니다.' };
            break;
          }
          
          // 워크스페이스 이름으로 워크스페이스 찾기
          const allWorkspaces = await workspaceService.read();
          const targetWorkspace = allWorkspaces.find(w => w.name === workspaceName);
          
          if (!targetWorkspace) {
            result = { status: 'error', message: `"${workspaceName}" 워크스페이스를 찾을 수 없습니다.` };
            break;
          }
          
          // 사용자가 해당 워크스페이스의 멤버인지 확인
          const userWorkspaceMember = await workspaceMemberService.readByUserIdAndWorkspaceId(adminId!, targetWorkspace.id);
          
          if (!userWorkspaceMember) {
            result = { status: 'error', message: `"${workspaceName}" 워크스페이스의 멤버가 아닙니다.` };
            break;
          }
          
          // 해당 워크스페이스의 팀 목록 조회
          const teams = await workspaceTeamService.readByWorkspaceId(targetWorkspace.id);
          const teamsArray = Array.isArray(teams) ? teams : [teams].filter(Boolean);
          
          // 각 팀에 대해 사용자가 멤버인지 확인하고 정보 구성
          const teamsWithUserInfo = [];
          for (const team of teamsArray) {
            const teamMembers = await workspaceTeamUsersService.readByTeamId(team.id);
            const userMember = teamMembers.find(m => m.memberId === adminId);
            
            if (userMember) {
              teamsWithUserInfo.push({
                id: team.id,
                name: team.name,
                workspaceId: team.workspaceId,
                workspaceName: workspaceName,
                role: userMember.role
              });
            }
          }
          
          result = { 
            status: 'success', 
            action: 'list_teams',
            workspace: {
              id: targetWorkspace.id,
              name: targetWorkspace.name,
              description: targetWorkspace.description
            },
            teams: teamsWithUserInfo
          };
        } catch (error) {
          console.error('특정 워크스페이스 팀 목록 조회 오류:', error);
          result = { status: 'error', message: '팀 목록 조회 중 오류가 발생했습니다.' };
        }
        break;
      case 'general_chat':
        try {
          const type = aiResponse.parameters.type;
          const content = aiResponse.parameters.content;
          
          // 일반 대화는 별도의 API 호출 없이 응답 메시지만 반환
          result = { 
            status: 'success', 
            action: 'general_chat',
            chat: {
              type,
              content: content || '',
              message: aiResponse.message
            }
          };
        } catch (error) {
          console.error('일반 대화 처리 오류:', error);
          result = { status: 'error', message: '대화 처리 중 오류가 발생했습니다.' };
        }
        break;

      case 'attendance_check':
        skipActivityLog = true; // 출석체크는 활동로그 기록 건너뛰기
        try {
          const hasCheckedToday = await attendanceRecordsService.checkTodayAttendance(userId);
          
          if (hasCheckedToday) {
            result = {
              status: 'success',
              message: '오늘 출석체크는 완료했습니다.',
              data: { alreadyChecked: true }
            };
          } else {
            // 출석체크 기록 생성 (한국 시간 기준)
            const now = new Date();
            const kstOffset = 9 * 60 * 60 * 1000; // KST는 UTC+9
            const kstTime = new Date(now.getTime() + kstOffset + (now.getTimezoneOffset() * 60 * 1000));
            
            const attendanceData = {
              userId: userId,
              checkInTime: kstTime,
              status: 'present'
            };
            
            await attendanceRecordsService.create(attendanceData);
            
            result = {
              status: 'success',
              message: '출석체크가 완료되었습니다.',
              data: { alreadyChecked: false }
            };
          }
          
          console.log('출석체크 처리 완료:', result);
        } catch (error) {
          console.error('출석체크 처리 오류:', error);
          result = { status: 'error', message: '출석체크 처리 중 오류가 발생했습니다.' };
        }
        break;
      
      case 'specify_workspace':
        try {
          const workspaceName = aiResponse.parameters.workspaceName;
          
          if (!workspaceName) {
            result = { status: 'error', message: '워크스페이스 이름이 필요합니다.' };
            break;
          }
          
          // 사용자의 워크스페이스 목록에서 찾기
          const userWorkspaces = await workspaceService.read();
          const targetWorkspace = userWorkspaces.find(ws => 
            ws.name.toLowerCase().includes(workspaceName.toLowerCase()) ||
            workspaceName.toLowerCase().includes(ws.name.toLowerCase())
          );
          
          if (!targetWorkspace) {
            result = { 
              status: 'error', 
              message: `"${workspaceName}" 워크스페이스를 찾을 수 없습니다. 먼저 워크스페이스를 생성해주세요.` 
            };
            break;
          }
          
          // 세션에 워크스페이스 ID 저장 (실제로는 세션 관리가 필요)
          // 여기서는 workspaceIdForLog를 설정하여 이후 활동로그에 사용
          workspaceIdForLog = targetWorkspace.id;
          
          result = { 
            status: 'success', 
            message: `"${targetWorkspace.name}" 워크스페이스가 지정되었습니다. 이제부터 이 워크스페이스에 활동로그를 기록합니다.`,
            data: { workspaceId: targetWorkspace.id, workspaceName: targetWorkspace.name }
          };
          
        } catch (error) {
          console.error('워크스페이스 지정 오류:', error);
          result = { status: 'error', message: '워크스페이스 지정 중 오류가 발생했습니다.' };
        }
        break;
    }

    // 활동 로그는 사용자가 명시적으로 요청할 때만 생성됨
    // 다른 모든 AI 챗봇 요청에 대해서는 활동로그를 기록하지 않음

    res.json({
      success: true,
      data: {
        aiResponse,
        result
      }
    });
  } catch (error) {
    console.error('챗봇 오류:', error);
    res.status(500).json({
      success: false,
      message: '챗봇 처리 중 오류가 발생했습니다.'
    });
  }
});

export default chatRouter;