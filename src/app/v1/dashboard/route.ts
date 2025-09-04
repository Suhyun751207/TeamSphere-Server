import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
const dashboardRouter = Router();

dashboardRouter.get("/", catchAsyncErrors(async (_req, res) => {
    return res.status(200).json({ message: "test" });
}));

export default dashboardRouter;