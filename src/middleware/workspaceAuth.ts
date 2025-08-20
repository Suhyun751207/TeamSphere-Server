import { Request, Response, NextFunction } from 'express';
import workspaceMemberService from '../services/workspacesMembers.ts';

export const checkWorkspaceAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const workspaceId = Number(req.params.workspaceId);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
      return;
    }

    if (!workspaceId || isNaN(workspaceId)) {
      res.status(400).json({
        success: false,
        message: '유효하지 않은 워크스페이스 ID입니다.'
      });
      return;
    }

    // 사용자가 해당 워크스페이스의 멤버인지 확인
    const userWorkspaceMembers = await workspaceMemberService.readByUserId(userId);
    const hasAccess = userWorkspaceMembers.some(member => member.workspaceId === workspaceId);

    if (!hasAccess) {
      res.status(403).json({
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
  try {
    const userId = req.user?.userId;
    const workspaceId = Number(req.params.workspaceId);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
      return;
    }

    if (!workspaceId || isNaN(workspaceId)) {
      res.status(400).json({
        success: false,
        message: '유효하지 않은 워크스페이스 ID입니다.'
      });
      return;
    }

    // 사용자가 해당 워크스페이스의 멤버인지 확인
    const userWorkspaceMembers = await workspaceMemberService.readByUserId(userId);
    const userMember = userWorkspaceMembers.find(member => member.workspaceId === workspaceId);

    if (!userMember) {
      res.status(403).json({
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
