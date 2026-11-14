/**преобразует ошибки в единый JSON-формат*/
import type { ErrorRequestHandler } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  // Не отправляем внутренние детали ошибки клиенту в production.
  if (env.nodeEnv !== "production") {
    console.error(error);
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Внутренняя ошибка сервера",
    },
  });
};
