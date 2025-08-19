import { Router } from "express";
import catchAsyncErrors from "../../../utils/catchAsyncErrors.ts";
import userService from "../../../services/Users.ts";
import userIdRouter from "./[userId]/router.ts";

const userRouter = Router({ mergeParams: true });

userRouter.get("/", catchAsyncErrors(async (_req, res) => {
  const users = await userService.read();
  return res.status(200).json(users);
}));

userRouter.use("/:userId", userIdRouter);

export default userRouter;