import { createTypeGuard } from "type-wizard";
import { profilesCreate } from "../Profiles";
import { genders_enum } from "../../services/ENUM/genders_enum";

export const isProfilesCreate=createTypeGuard<profilesCreate>({
    userId: {type: "number"},
    name: {type: "string"},
    age: {type: "number", nullable: true},
    gender: {type: "string", enum: genders_enum},
    phone: {type: "string", nullable: true},
    imagePath: {type: "string", nullable: true},
    subscriptionState: {type: "string"}
}).optional();
