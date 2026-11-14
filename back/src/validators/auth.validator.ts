import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../config/constants.js";
import { AppError } from "../utils/app-error.js";

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

function ensureObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError("Ожидается JSON-объект", 400, "INVALID_BODY");
  }
  return value as Record<string, unknown>;
}

function normalizeAndCheckEmail(value: unknown): string {
  if (typeof value !== "string") {
    throw new AppError("Укажите email", 400, "INVALID_EMAIL");
  }

  const email = value.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email.length > 254 || !emailPattern.test(email)) {
    throw new AppError("Укажите корректный email", 400, "INVALID_EMAIL");
  }

  return email;
}

function checkPassword(value: unknown, isRegistration: boolean): string {
  if (typeof value !== "string") {
    throw new AppError("Укажите пароль", 400, "INVALID_PASSWORD");
  }

  if (isRegistration && value.length < PASSWORD_MIN_LENGTH) {
    throw new AppError(
      `Пароль должен содержать не менее ${PASSWORD_MIN_LENGTH} символов`,
      400,
      "PASSWORD_TOO_SHORT",
    );
  }

  if (Buffer.byteLength(value, "utf8") > PASSWORD_MAX_LENGTH) {
    throw new AppError("Пароль слишком длинный", 400, "PASSWORD_TOO_LONG");
  }

  if (!isRegistration && value.length === 0) {
    throw new AppError("Укажите пароль", 400, "INVALID_PASSWORD");
  }

  return value;
}

export function validateRegister(body: unknown): RegisterInput {
  const data = ensureObject(body);
  return {
    email: normalizeAndCheckEmail(data.email),
    password: checkPassword(data.password, true),
  };
}

export function validateLogin(body: unknown): LoginInput {
  const data = ensureObject(body);
  return {
    email: normalizeAndCheckEmail(data.email),
    password: checkPassword(data.password, false),
  };
}
