/** Бизнес-логика работы со справочником сотрудников */
import type { CreateEmployeeInput, EmployeeFilters } from "../models/employee.model.js";
import { employeeRepository } from "../repositories/employee.repository.js";
import { AppError } from "../utils/app-error.js";

export class EmployeeService {
  getEmployees(filters: EmployeeFilters) {
    try {
      return employeeRepository.findAll(filters);
    } catch {
      throw new AppError(
        "Не удалось получить список сотрудников",
        500,
        "EMPLOYEES_FETCH_FAILED",
      );
    }
  }

  getDepartments(): string[] {
    try {
      return employeeRepository.findDepartments();
    } catch {
      throw new AppError(
        "Не удалось получить список отделов",
        500,
        "DEPARTMENTS_FETCH_FAILED",
      );
    }
  }

  createEmployee(input: CreateEmployeeInput) {
    try {
      return employeeRepository.create(input);
    } catch {
      throw new AppError(
        "Не удалось сохранить сотрудника",
        500,
        "EMPLOYEE_CREATE_FAILED",
      );
    }
  }

  deleteEmployee(id: string): void {
    if (!id || !id.trim()) {
      throw new AppError(
        "Не указан идентификатор сотрудника",
        400,
        "EMPLOYEE_ID_REQUIRED",
      );
    }

    let removed: boolean;
    try {
      removed = employeeRepository.deleteById(id);
    } catch {
      throw new AppError(
        "Не удалось удалить сотрудника",
        500,
        "EMPLOYEE_DELETE_FAILED",
      );
    }

    if (!removed) {
      throw new AppError("Сотрудник не найден", 404, "EMPLOYEE_NOT_FOUND");
    }
  }
}

export const employeeService = new EmployeeService();