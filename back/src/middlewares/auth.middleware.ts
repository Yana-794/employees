/** разрешает доступ к защищённым маршрутам только с активной сессией */
import type { RequestHandler } from "express";
import { SESSION_COOKIE_NAME } from "../config/constants.js";
import { authService } from "../services/auth.service.js";
import { AppError } from "../utils/app-error.js";

export const requireAuth: RequestHandler = (req, _res, next) => {
  try {
    const token = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    const user = authService.authenticate(token);

    if (!user) {
      throw new AppError("Требуется авторизация", 401, "UNAUTHORIZED");
    }

    // Пользователь доступен в контроллерах через req.user
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
