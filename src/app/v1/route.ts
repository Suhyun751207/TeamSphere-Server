import { Router } from "express";
import catchAsyncErrors from "../../utils/catchAsyncErrors.ts";
import authRouter from "./auth/route.ts";
const v1Router = Router();

v1Router.get("/", catchAsyncErrors(async (_req, res) => {
  return res.status(200).json({ message: "test" });
}));

v1Router.use("/auth", authRouter);

export default v1Router;