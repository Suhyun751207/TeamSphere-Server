import { createTypeGuard } from "type-wizard";
import { UserCreate } from "../Users.ts";

export const isUserCreate=createTypeGuard<UserCreate>({
    email: {type: "string"},
    password: {type: "string"}
});
