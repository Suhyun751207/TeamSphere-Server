import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.ts';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // 현재 로그인 중인 사용자의 정보를 확인하여 req.user에 저장
  try {
    // Authorization 헤더에서 토큰 추출 (Bearer 토큰)
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.accesstoken;

    if (!token) {
      res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
      return;
    }

    // JWT 토큰 검증
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  // 현재 로그인 중인 사용자의 정보를 확인하여 req.user에 저장
  try {
    const token = req.cookies?.accesstoken;

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    next();
  } catch (error) {
    next();
  }
};
