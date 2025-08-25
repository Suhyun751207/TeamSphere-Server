import { Router } from "express";
import catchAsyncErrors from "@utils/catchAsyncErrors.ts";
import { authenticateToken } from "@middleware/auth.ts";
import userService from "@services/Users";
import profilesService from "@services/Profiles";
import { isProfilesCreate } from "@interfaces/guard/Profiles.guard";
import { genders_enum } from "@services/ENUM/genders_enum";

const ProfileIdRouter = Router({ mergeParams: true });

ProfileIdRouter.get('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const userId = Number(req.params?.profileId);
    const user = await userService.readById(userId);
    const profile = await profilesService.readById(userId);
    const data = { user, profile }
    return res.status(200).json(data);
}));

ProfileIdRouter.patch('/', authenticateToken, catchAsyncErrors(async (req, res) => {
    const userId = Number(req.params?.profileId);
    const { name, age, gender, phone, imagePath } = req.body;
    if (!Object.values(genders_enum).includes(gender)) {
        return res.status(400).json({ message: "Invalid gender value" });
    }
    const body = { name, age, gender, phone, imagePath, subscriptionState: "Free", userId };
    if (!isProfilesCreate(body)) return res.status(400).json({ message: isProfilesCreate.message(body) });
    const data = await profilesService.update(userId, body);
    return res.status(200).json(data);
}));

export default ProfileIdRouter;