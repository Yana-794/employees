import { randomUUID } from "node:crypto";
import { db } from "../config/database.js";
import type { CreateEmployeeInput, Employee, EmployeeFilters } from "../models/employee.model.js";
import { normalizeSearchValue } from "../utils/normalization.js";

type EmployeeRow = {
  id: string;
  full_name: string;
  position: string;
  department: string;
  created_at: string;
};

function mapEmployee(row: EmployeeRow): Employee {
  return {
    id: row.id,
    fullName: row.full_name,
    position: row.position,
    department: row.department,
    createdAt: row.created_at,
  };
}

export class EmployeeRepository {
  findAll(filters: EmployeeFilters = {}): Employee[] {
    const conditions: string[] = [];
    const params: string[] = [];

    if (filters.query) {
      conditions.push("instr(full_name_search, ?) > 0");
      params.push(normalizeSearchValue(filters.query));
    }

    if (filters.department) {
      conditions.push("department = ?");
      params.push(filters.department);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = db.prepare(`
      SELECT id, full_name, position, department, created_at
      FROM employees
      ${where}
      ORDER BY full_name COLLATE NOCASE ASC
    `).all(...params) as EmployeeRow[];

    return rows.map(mapEmployee);
  }

  findDepartments(): string[] {
    const rows = db.prepare(`
      SELECT name
      FROM departments
      ORDER BY name COLLATE NOCASE ASC
    `).all() as Array<{ name: string }>;

    return rows.map((row) => row.name);
  }


  create(input: CreateEmployeeInput): Employee {
    const employee: Employee = {
      id: randomUUID(),
      fullName: input.fullName,
      position: input.position,
      department: input.department,
      createdAt: new Date().toISOString(),
    };

    const insertDepartment = db.prepare(`
      INSERT OR IGNORE INTO departments (name, created_at)
      VALUES (?, ?)
    `);

    const insertEmployee = db.prepare(`
      INSERT INTO employees
        (id, full_name, full_name_search, position, department, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const tx = db.transaction(() => {
      insertDepartment.run(employee.department, employee.createdAt);
      insertEmployee.run(
        employee.id,
        employee.fullName,
        normalizeSearchValue(employee.fullName),
        employee.position,
        employee.department,
        employee.createdAt,
      );
    });

    tx();
    return employee;
  }

  deleteById(id: string): boolean {
    const result = db
      .prepare(`DELETE FROM employees WHERE id = ?`)
      .run(id);

    return result.changes > 0;
  }
}

export const employeeRepository = new EmployeeRepository();