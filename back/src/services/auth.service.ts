/** Бизнес-логика регистрации, входа, проверки сессии и выхода пользователя */
import { SESSION_LIFETIME_MS } from "../config/constants.js";
import type { PublicUser } from "../models/user.model.js";
import { sessionRepository } from "../repositories/session.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/app-error.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { createSessionToken, hashSessionToken } from "../utils/session.js";
import { toPublicUser } from "../models/user.model.js";

export interface LoginResult {
  user: PublicUser;
  sessionToken: string;
  expiresAt: string;
}

export class AuthService {
  async register(email: string, password: string): Promise<PublicUser> {
    if (userRepository.findByEmail(email)) {
      throw new AppError("Пользователь с таким email уже существует", 409, "EMAIL_EXISTS");
    }

    const passwordHash = await hashPassword(password);
    const user = userRepository.create(email, passwordHash);

    // Повторная проверка на случай одновременной регистрации с тем же email.
    if (!user) {
      throw new AppError("Пользователь с таким email уже существует", 409, "EMAIL_EXISTS");
    }

    return toPublicUser(user);
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const user = userRepository.findByEmail(email);

    // не раскрываем клиенту, существует ли указанный email
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new AppError("Неверный email или пароль", 401, "INVALID_CREDENTIALS");
    }

    const sessionToken = createSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS).toISOString();

    sessionRepository.create(
      user.id,
      hashSessionToken(sessionToken),
      expiresAt,
    );

    return {
      user: toPublicUser(user),
      sessionToken,
      expiresAt,
    };
  }

  authenticate(sessionToken: string | undefined): PublicUser | null {
    if (!sessionToken) return null;

    // В бд ищем сессию по хешу, исходный токен остаётся только в куки браузера
    const session = sessionRepository.findActiveByTokenHash(
      hashSessionToken(sessionToken),
    );

    return session?.user ?? null;
  }

  logout(sessionToken: string | undefined): void {
    if (!sessionToken) return;
    sessionRepository.revoke(hashSessionToken(sessionToken));
  }
}

export const authService = new AuthService();
