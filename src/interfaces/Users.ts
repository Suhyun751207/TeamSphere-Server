export const userKeys=['id','email','password','createdAt','updatedAt'] as const;
export interface User {
  id: number;
  email:string;
  password:string;
  createdAt:Date;
  updatedAt:Date;
}

export type UserAutoSetKeys="id"|"createdAt"|"updatedAt"
export interface UserCreate extends Omit<User, UserAutoSetKeys>{};
export interface UserUpdate extends Partial<UserCreate>{}; 