import { Request, Response, NextFunction } from 'express';
import workspaceMemberService from '../services/workspacesMembers';
import workspaceTeamUsersService from '../services/WorkspaceTeamUsers';

export const checkWorkspaceAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // 현재 로그인 중인 사용자의 정보를 확인하여 req.user에 저장
  try {
    const userId = req.user?.userId;
    const workspaceId = Number(req.params.workspaceId);

    if (!userId) {
      res.status(403).json({
        success: false,
        message: '인증이 필요합니다.'
      });
      return;
    }

    if (!workspaceId || isNaN(workspaceId)) {
      res.status(404).json({
        success: false,
        message: '유효하지 않은 워크스페이스 ID입니다.'
      });
      return;
    }

    // 사용자가 해당 워크스페이스의 멤버인지 확인
    const userWorkspaceMembers = await workspaceMemberService.readByUserId(userId);
    const hasAccess = userWorkspaceMembers.some(member => member.workspaceId === workspaceId);

    if (!hasAccess) {
      res.status(401).json({
        success: false,
        message: '해당 워크스페이스에 접근할 권한이 없습니다.'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

export const checkWorkspaceAdminOrManager = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // 현재 로그인 중인 사용자의 정보를 확인하여 req.user에 저장
  try {
    const userId = req.user?.userId;
    const workspaceId = Number(req.params.workspaceId);

    if (!userId) {
      res.status(403).json({
        success: false,
        message: '인증이 필요합니다.'
      });
      return;
    }

    if (!workspaceId || isNaN(workspaceId)) {
      res.status(404).json({
        success: false,
        message: '유효하지 않은 워크스페이스 ID입니다.'
      });
      return;
    }

    // 사용자가 해당 워크스페이스의 멤버인지 확인
    const userWorkspaceMembers = await workspaceMemberService.readByUserId(userId);
    const userMember = userWorkspaceMembers.find(member => member.workspaceId === workspaceId);

    if (!userMember) {
      res.status(401).json({
        success: false,
        message: '해당 워크스페이스에 접근할 권한이 없습니다.'
      });
      return;
    }

    // Admin 또는 Manager 권한 확인
    if (userMember.role !== 'Admin' && userMember.role !== 'Manager') {
      res.status(403).json({
        success: false,
        message: '관리자 또는 매니저 권한이 필요합니다.'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

export const checkTeamAdminOrManager = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // 현재 로그인 중인 사용자의 정보를 확인하여 req.user에 저장
  try {
    const userId = req.user?.userId;
    const workspaceId = Number(req.params.workspaceId);
    const teamId = Number(req.params.teamId);

    if (!userId) {
      res.status(403).json({
        success: false,
        message: '인증이 필요합니다.'
      });
      return;
    }

    if (!workspaceId || isNaN(workspaceId)) {
      res.status(404).json({
        success: false,
        message: '유효하지 않은 워크스페이스 ID입니다.'
      });
      return;
    }

    if (!teamId || isNaN(teamId)) {
      res.status(404).json({
        success: false,
        message: '유효하지 않은 팀 ID입니다.'
      });
      return;
    }
    const userWorkspaceMembers = await workspaceMemberService.readByUserId(userId);
    const hasWorkspaceAccess = userWorkspaceMembers.some(member => member.workspaceId === workspaceId);

    if (!hasWorkspaceAccess) {
      res.status(401).json({
        success: false,
        message: '해당 워크스페이스에 접근할 권한이 없습니다.'
      });
      return;
    }

    const userTeamRole = await workspaceMemberService.readByWorkspacesIdUserId(workspaceId, userId);
    if (!userTeamRole) {
      res.status(403).json({
        success: false,
        message: '해당 팀에 소속되어 있지 않습니다.'
      });
      return;
    }

    if (userTeamRole[0].role !== 'Admin' && userTeamRole[0].role !== 'Manager') {
      res.status(403).json({
        success: false,
        message: '팀 관리자 또는 매니저 권한이 필요합니다.'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};


export const checkTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const workspaceId = Number(req.params.workspaceId);
    const teamId = Number(req.params.teamId);

    if (!userId) {
      res.status(403).json({
        success: false,
        message: '인증이 필요합니다.'
      });
      return;
    }

    if (!workspaceId || isNaN(workspaceId)) {
      res.status(404).json({
        success: false,
        message: '유효하지 않은 워크스페이스 ID입니다.'
      });
      return;
    }

    if (!teamId || isNaN(teamId)) {
      res.status(404).json({
        success: false,
        message: '유효하지 않은 팀 ID입니다.'
      });
      return;
    }
    const userWorkspaceMembers = await workspaceMemberService.readByUserId(userId);
    const hasWorkspaceAccess = userWorkspaceMembers.some(member => member.workspaceId === workspaceId);

    if (!hasWorkspaceAccess) {
      res.status(401).json({
        success: false,
        message: '해당 워크스페이스에 접근할 권한이 없습니다.'
      });
      return;
    }

    const userTeamRole = await workspaceMemberService.readByWorkspacesIdUserId(workspaceId, userId);
    if (!userTeamRole) {
      res.status(403).json({
        success: false,
        message: '해당 팀에 소속되어 있지 않습니다.'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

export const TeamUserIdSelect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const workspaceId = Number(req.params.workspaceId);

    if (!userId) {
      res.status(403).json({
        success: false,
        message: '인증이 필요합니다.'
      });
      return;
    }

    if (!workspaceId || isNaN(workspaceId)) {
      res.status(404).json({
        success: false,
        message: '유효하지 않은 워크스페이스 ID입니다.'
      });
      return;
    }

    const userWorkspaceMembers = await workspaceMemberService.readByUserId(userId);

    if (!userWorkspaceMembers || userWorkspaceMembers.length === 0) {
      res.status(404).json({
        success: false,
        message: '워크스페이스 멤버 정보를 찾을 수 없습니다.'
      });
      return;
    }
    const currentWorkspaceMember = userWorkspaceMembers.find(member => member.workspaceId === workspaceId);

    if (!currentWorkspaceMember) {
      res.status(404).json({
        success: false,
        message: '해당 워크스페이스의 멤버 정보를 찾을 수 없습니다.'
      });
      return;
    }

    const teamUserInfo = await workspaceTeamUsersService.readByMemberId(currentWorkspaceMember.id);

    if (!teamUserInfo || teamUserInfo.length === 0) {
      res.status(404).json({
        success: false,
        message: '팀 사용자 정보를 찾을 수 없습니다.'
      });
      return;
    }

    req.team = teamUserInfo[0];
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};
