import { createTypeGuard } from "type-wizard";
import { profilesCreate } from "../Profiles.ts";

export const isProfilesCreate=createTypeGuard<profilesCreate>({
    userId: {type: "number"},
    name: {type: "string"},
    age: {type: "number", nullable: true},
    gender: {type: "string"},
    phone: {type: "string", nullable: true},
    imagePath: {type: "string", nullable: true},
    subscriptionState: {type: "string"}
}).optional();
