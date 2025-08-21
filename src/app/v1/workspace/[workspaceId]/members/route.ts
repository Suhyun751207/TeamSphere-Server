import { Router } from "express";
import catchAsyncErrors from "../../../../../utils/catchAsyncErrors.ts";
import workspaceMemberService from "../../../../../services/workspacesMembers.ts";
import userService from "../../../../../services/Users.ts";
import profilesService from "../../../../../services/Profiles.ts";
import { authenticateToken } from "../../../../../middleware/auth.ts";
import { checkWorkspaceAccess, checkWorkspaceAdminOrManager } from "../../../../../middleware/workspaceAuth.ts";
import { workspaceMember } from "../../../../../interfaces/workspacesMembers.ts";
import { isWorkspaceMemberCreate } from "../../../../../interfaces/guard/workspacesMembers.guard.ts";

const workspaceIdMemberRouter = Router({ mergeParams: true });

workspaceIdMemberRouter.get("/", authenticateToken, checkWorkspaceAccess, catchAsyncErrors(async (req, res) => {
    const workspaceId = Number(req.params.workspaceId);
    const workspaceMemberResult = await workspaceMemberService.read(workspaceId) as unknown as workspaceMember[];
    const membersWithDetails = await Promise.all(
        workspaceMemberResult.map(async (member) => {
            const user = await userService.read(member.userId);
            const profile = await profilesService.read(member.userId);
            return {
                ...member,
                user: user,
                profile: profile || null
            };
        })
    );

    return res.status(200).json(membersWithDetails);
}));

workspaceIdMemberRouter.post("/", authenticateToken, checkWorkspaceAdminOrManager, catchAsyncErrors(async (req, res) => {
    const body = req.body;
    const workspaceId = Number(req.params.workspaceId);
    const data = {...body, workspaceId};
    if (!isWorkspaceMemberCreate(data)) return res.status(400).json({ message: isWorkspaceMemberCreate.message(data) });
    const userId = req.body.userId;
    const role = data.role;
    if (!role) return res.status(400).json({ message: "role is required" });
    const existingMembers = await workspaceMemberService.read(workspaceId) as unknown as workspaceMember[];
    const isUserAlreadyMember = existingMembers.some((member: workspaceMember) => member.userId === userId);
    if (isUserAlreadyMember) {
        return res.status(400).json({ message: "이미 존재하는 유저입니다." });
    }
    const workspaceMemberResult = await workspaceMemberService.create({workspaceId, userId: userId!, role});
    return res.status(201).json(workspaceMemberResult);
}));

export default workspaceIdMemberRouter;
