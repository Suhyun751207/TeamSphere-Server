import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import authRouter from "./auth/route.ts";
import workspaceRouter from "./workspace/router.ts";
const v1Router = Router();

v1Router.get("/", catchAsyncErrors(async (_req, res) => {
  return res.status(200).json({ message: "test" });
}));

v1Router.use("/auth", authRouter);
v1Router.use("/workspace", workspaceRouter);

export default v1Router;