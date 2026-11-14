/** Возвращает единый JSON-ответ для маршрутов, которых нет в приложении */
import type { RequestHandler } from "express";
import { AppError } from "../utils/app-error.js";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(`Маршрут ${req.method} ${req.originalUrl} не найден`, 404, "NOT_FOUND"));
};
