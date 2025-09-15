import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors";
import authRouter from "./auth/route";
import workspaceRouter from "./workspace/router";
import userRouter from "./user/route";
import dashboardRouter from "./dashboard/route";
import aiRouter from "./ai/route";
const v1Router = Router();

v1Router.get("/", catchAsyncErrors(async (_req, res) => {
  return res.status(200).json({ message: "test" });
}));

v1Router.use("/auth", authRouter);
v1Router.use("/workspace", workspaceRouter);
v1Router.use("/user", userRouter);
v1Router.use("/dashboard", dashboardRouter);
v1Router.use("/ai", aiRouter);

export default v1Router;