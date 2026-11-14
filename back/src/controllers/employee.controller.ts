import type { RequestHandler } from "express";
import { employeeService } from "../services/employee.service.js";
import {
  validateCreateEmployee,
  validateEmployeeFilters,
} from "../validators/employee.validator.js";

export const getEmployees: RequestHandler = (req, res, next) => {
  try {
    const filters = validateEmployeeFilters(req.query as Record<string, unknown>);
    const employees = employeeService.getEmployees(filters);
    res.json({ employees });
  } catch (error) {
    next(error);
  }
};

export const getDepartments: RequestHandler = (_req, res, next) => {
  try {
    res.json({ departments: employeeService.getDepartments() });
  } catch (error) {
    next(error);
  }
};

export const createEmployee: RequestHandler = (req, res, next) => {
  try {
    const input = validateCreateEmployee(req.body);
    const employee = employeeService.createEmployee(input);
    res.status(201).json({ employee });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee: RequestHandler = (req, res, next) => {
  try {
    employeeService.deleteEmployee(req.params.id as string);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};