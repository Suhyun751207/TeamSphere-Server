import { Router } from "express";
import chatRouter from "./chat/route";
const aiRouter = Router();

aiRouter.use("/chat", chatRouter);

export default aiRouter;