/** Утилиты для создания случайного токена сессии и его хеширования. */
import { createHash, randomBytes } from "node:crypto";

/** Создаёт криптографически стойкий токен, который будет храниться в куки */
export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** В базе хранится только SHA-256-хеш токена, а не сам токен из куки */
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
