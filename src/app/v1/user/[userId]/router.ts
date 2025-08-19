import { Router } from "express";
import catchAsyncErrors from "../../../../utils/catchAsyncErrors.ts";
import userService from "../../../../services/Users.ts";
import profilesService from "../../../../services/Profiles.ts";


const userIdRouter = Router({ mergeParams: true });

userIdRouter.get("/", catchAsyncErrors(async (req, res) => {
    const { userId } = req.params;
    const user = await userService.read(Number(userId));
    const profile = await profilesService.read(Number(userId));
    return res.status(200).json({ user, profile });
}));

export default userIdRouter;