/** Проверка параметров поиска и обязательных полей нового сотрудника. */
import { EMPLOYEE_FIELD_LIMITS } from "../config/constants.js";
import type { CreateEmployeeInput, EmployeeFilters } from "../models/employee.model.js";
import { AppError } from "../utils/app-error.js";

const RUSSIAN_TEXT_PATTERN = /^[А-Яа-яЁё][А-Яа-яЁё\s-]*$/;

function readRequiredText(
  value: unknown,
  fieldName: string,
  maxLength: number,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AppError(`Поле «${fieldName}» обязательно`, 400, "REQUIRED_FIELD");
  }

  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length > maxLength) {
    throw new AppError(
      `Поле «${fieldName}» не должно превышать ${maxLength} символов`,
      400,
      "FIELD_TOO_LONG",
    );
  }

  return normalized;
}

/** ФИО: только русские буквы, пробел и дефис*/
function readFullName(value: unknown): string {
  const normalized = readRequiredText(
    value,
    "ФИО",
    EMPLOYEE_FIELD_LIMITS.fullName,
  );

  if (!RUSSIAN_TEXT_PATTERN.test(normalized)) {
    throw new AppError(
      "Поле «ФИО» может содержать только русские буквы, пробел и дефис",
      400,
      "INVALID_CHARACTERS",
    );
  }

  return normalized;
}

/**
 * Должность: разрешены любые символы, кроме цифр
 */
function readPosition(value: unknown): string {
  const normalized = readRequiredText(
    value,
    "Должность",
    EMPLOYEE_FIELD_LIMITS.position,
  );

  if (/\d/.test(normalized)) {
    throw new AppError(
      "Поле «Должность» не может содержать цифры",
      400,
      "INVALID_CHARACTERS",
    );
  }

  return normalized;
}

export function validateCreateEmployee(body: unknown): CreateEmployeeInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError("Ожидается JSON-объект", 400, "INVALID_BODY");
  }

  const data = body as Record<string, unknown>;

  return {
    fullName: readFullName(data.fullName),
    position: readPosition(data.position),
    department: readRequiredText(
      data.department,
      "Отдел",
      EMPLOYEE_FIELD_LIMITS.department,
    ),
  };
}

export function validateEmployeeFilters(query: Record<string, unknown>): EmployeeFilters {
  const rawQuery = typeof query.q === "string" ? query.q.trim() : "";
  const rawDepartment = typeof query.department === "string"
    ? query.department.trim()
    : "";

  if (rawQuery.length > EMPLOYEE_FIELD_LIMITS.fullName) {
    throw new AppError("Слишком длинный поисковый запрос", 400, "QUERY_TOO_LONG");
  }

  if (rawDepartment.length > EMPLOYEE_FIELD_LIMITS.department) {
    throw new AppError("Некорректное название отдела", 400, "INVALID_DEPARTMENT");
  }

  return {
    query: rawQuery || undefined,
    department: rawDepartment || undefined,
  };
}