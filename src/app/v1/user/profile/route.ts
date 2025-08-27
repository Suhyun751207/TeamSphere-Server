import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import userService from "@services/Users";
import profilesService from "@services/Profiles";
import { isProfilesCreate } from "@interfaces/guard/Profiles.guard";
import ProfileIdRouter from "./[profileId]/route.ts";
import { genders_enum } from "@services/ENUM/genders_enum";

const ProfileRouter = Router({ mergeParams: true });
ProfileRouter.use('/:profileId', ProfileIdRouter);

ProfileRouter.get('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const user = await userService.read();
    const profile = await profilesService.read();
    const data = { user, profile }
    return res.status(200).json(data);
}));

ProfileRouter.post('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const { name, age, gender, phone, imagePath } = req.body;
    const userId = req.user?.userId;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!Object.values(genders_enum).includes(gender)) {
        return res.status(400).json({ message: "Invalid gender value" });
    }
    
    const body = { name, age, gender, phone, imagePath, subscriptionState: "Free", userId };
    if (!isProfilesCreate(body)) return res.status(400).json({ message: isProfilesCreate.message(body) });
    const data = await profilesService.create(body);
    return res.status(200).json(data);
}));

export default ProfileRouter;