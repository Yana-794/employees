/** Данные активной сессии */
import type { PublicUser } from "./user.model.js";

export interface ActiveSession {
  user: PublicUser;
  expiresAt: string;
}
