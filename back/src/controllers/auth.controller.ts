/** Контроллер авторизации: получает HTTP-данные и вызывает AuthService */
import type { RequestHandler } from "express";
import { SESSION_COOKIE_NAME, SESSION_LIFETIME_MS } from "../config/constants.js";
import { env } from "../config/env.js";
import { authService } from "../services/auth.service.js";
import { validateLogin, validateRegister } from "../validators/auth.validator.js";

const cookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: "lax" as const,
  path: "/",
};

export const register: RequestHandler = async (req, res, next) => {
  try {
    const input = validateRegister(req.body);
    const user = await authService.register(input.email, input.password);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const input = validateLogin(req.body);
    const result = await authService.login(input.email, input.password);

    res.cookie(SESSION_COOKIE_NAME, result.sessionToken, {
      ...cookieOptions,
      maxAge: SESSION_LIFETIME_MS,
    });

    res.json({ user: result.user });
  } catch (error) {
    next(error);
  }
};

export const me: RequestHandler = (req, res) => {
  // Маршрут защищён requireAuth, поэтому юзер к этому моменту уже установлен
  res.json({ user: req.user });
};

export const logout: RequestHandler = (req, res, next) => {
  try {
    const token = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    authService.logout(token);
    res.clearCookie(SESSION_COOKIE_NAME, cookieOptions);
    res.json({ message: "Вы вышли из системы" });
  } catch (error) {
    next(error);
  }
};
