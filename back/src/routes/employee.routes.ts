/** Все маршруты сотрудников закрыты middleware авторизации */
import { Router } from "express";
import {
  createEmployee,
  deleteEmployee,
  getDepartments,
  getEmployees,
} from "../controllers/employee.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const employeeRouter = Router();

employeeRouter.use(requireAuth);
employeeRouter.get("/departments", getDepartments);
employeeRouter.get("/", getEmployees);
employeeRouter.post("/", createEmployee);
employeeRouter.delete("/:id", deleteEmployee);

