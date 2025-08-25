import { ResultSetHeader } from "mysql2-wizard";
import userService from "./Users.ts";
import { User, UserCreate, UserUpdate } from "../interfaces/Users.ts";
import { hashPassword, comparePassword } from "../utils/password.ts";
import { generateToken, JwtPayload } from "../utils/jwt.ts";

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'password'>;
  token?: string;
}

async function signup(data: UserCreate): Promise<AuthResponse> {
  const existingUsers = await userService.read();
  const existingUser = existingUsers.find(user => user.email === data.email);
  if (existingUser) return { success: false, message: "이미 존재하는 이메일입니다." }
  const hashedPassword = await hashPassword(data.password);
  const userCreateData: UserCreate = {
    email: data.email,
    password: hashedPassword
  };
  const result: ResultSetHeader = await userService.create(userCreateData);
  if (result.affectedRows === 0) return { success: false, message: "회원가입에 실패했습니다." }

  const newUser = await userService.read(result.insertId);

  if (!newUser) return { success: false, message: "사용자 정보를 찾을 수 없습니다." }
  const { password, ...userWithoutPassword } = newUser;
  return { success: true, message: "회원가입이 완료되었습니다.", user: userWithoutPassword };
}

async function login(data: UserCreate): Promise<AuthResponse> {
  const users = await userService.read();
  const user = users.find(u => u.email === data.email);

  if (!user) return { success: false, message: "이메일 또는 비밀번호가 올바르지 않습니다." }
  const isPasswordValid = await comparePassword(data.password, user.password);
  if (!isPasswordValid) return { success: false, message: "이메일 또는 비밀번호가 올바르지 않습니다." }

  const tokenPayload: JwtPayload = { userId: user.id, email: user.email };
  const token = generateToken(tokenPayload);

  const { password, ...userWithoutPassword } = user;
  return { success: true, message: "로그인이 완료되었습니다.", user: userWithoutPassword, token }
}

async function getProfile(userId: number): Promise<AuthResponse> {
  const user = await userService.read(userId);
  if (!user) return { success: false, message: "사용자를 찾을 수 없습니다." }

  const { password, ...userWithoutPassword } = user;
  return { success: true, message: "사용자 정보를 성공적으로 조회했습니다.", user: userWithoutPassword }
}

async function updatePassword(userId: number, data: UserUpdate, newPassword: string): Promise<AuthResponse> {
  const user = await userService.readById(userId);
  if (!user) return { success: false, message: "사용자를 찾을 수 없습니다." }
  if (!data.password) return { success: false, message: "비밀번호가 필요합니다." }

  const isPasswordValid = await comparePassword(data.password, user.password);
  if (!isPasswordValid) return { success: false, message: "비밀번호가 올바르지 않습니다." }

  const tokenPayload: JwtPayload = { userId: user.id, email: user.email };
  const token = generateToken(tokenPayload);
  const newPasswordHashed = await hashPassword(newPassword);
  const { password, ...userWithoutPassword } = user;
  await userService.update(userId, { password: newPasswordHashed, email: user.email })
  return { success: true, message: "비밀번호 변경이 완료되었습니다.", user: userWithoutPassword, token };
}

const authService = {
  signup,
  login,
  getProfile,
  updatePassword
};

export default authService;
