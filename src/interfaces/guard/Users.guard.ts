import { createTypeGuard } from "type-wizard";
import { UserCreate, UserUpdate } from "../Users.ts";

export const isUserCreate=createTypeGuard<UserCreate>({
    email: {type: "string"},
    password: {type: "string"}
});

export const isUserUpdate=createTypeGuard<UserUpdate>({
    email: {type: "string"},
    password: {type: "string"}
});