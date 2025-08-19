import { Gender } from "../services/ENUM/genders_enum.ts";
import { SubscriptionState } from "../services/ENUM/subscription_states_enum.ts";

export const profilesKeys=['userId','name','age','gender','phone','imagePath','subscriptionState','createdAt','updatedAt'] as const;
export interface profiles {
  userId: number;
  name:string;
  age:number | null;
  gender:Gender;
  phone:string | null;
  imagePath:string | null;
  subscriptionState:SubscriptionState;
  createdAt:Date;
  updatedAt:Date;
}

export type profilesAutoSetKeys="createdAt"|"updatedAt"
export interface profilesCreate extends Omit<profiles, profilesAutoSetKeys>{};
export interface profilesUpdate extends Partial<profilesCreate>{}; 