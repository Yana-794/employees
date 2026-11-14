/** Ошибка с HTTP-статусом и машинным кодом для контролируемого ответа API */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(message: string, code = "BAD_REQUEST"): AppError {
    return new AppError(message, 400, code);
  }

  static notFound(message: string, code = "NOT_FOUND"): AppError {
    return new AppError(message, 404, code);
  }

  static conflict(message: string, code = "CONFLICT"): AppError {
    return new AppError(message, 409, code);
  }

  static internal(message = "Внутренняя ошибка сервера", code = "INTERNAL_ERROR"): AppError {
    return new AppError(message, 500, code);
  }
}