/**
 * Подключение к SQLite и создание схемы
 * Файл базы хранится по DATABASE_PATH; в докере этот путь подключён к volume
 */
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { env } from "./env.js";

const databasePath = env.databasePath === ":memory:"
  ? ":memory:"
  : isAbsolute(env.databasePath)
    ? env.databasePath
    : resolve(process.cwd(), env.databasePath);

if (databasePath !== ":memory:") {
  mkdirSync(dirname(databasePath), { recursive: true });
}

export const db = new Database(databasePath);

// Включаем внешние ключи и WAL для более устойчивой работы с файлом SQLite
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 5000");

/** Создаёт таблицы и заполняет справочник пятью демонстрационными сотрудниками */
export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      revoked_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id
      ON auth_sessions(user_id);

    CREATE TABLE IF NOT EXISTS departments (
      name TEXT PRIMARY KEY COLLATE NOCASE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      full_name_search TEXT NOT NULL,
      position TEXT NOT NULL,
      department TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_employees_department
      ON employees(department);
  `);

  db.exec(`
    INSERT OR IGNORE INTO departments (name, created_at)
    SELECT department, MIN(created_at)
    FROM employees
    GROUP BY department
  `);

  const demoEmployees = [
    ["demo-employee-1", "Анна Смирнова", "Менеджер проектов", "Разработка"],
    ["demo-employee-2", "Иван Петров", "Frontend-разработчик", "Разработка"],
    ["demo-employee-3", "Мария Иванова", "Системный аналитик", "Аналитика"],
    ["demo-employee-4", "Алексей Соколов", "Специалист поддержки", "Поддержка"],
    ["demo-employee-5", "Екатерина Волкова", "HR-специалист", "HR"],
  ] as const;

  const insertDemoDepartment = db.prepare(`
    INSERT OR IGNORE INTO departments (name, created_at)
    VALUES (?, ?)
  `);

  const insertDemoEmployee = db.prepare(`
    INSERT OR IGNORE INTO employees
      (id, full_name, full_name_search, position, department, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  const normalize = (value: string) =>
    value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("ru-RU");

  const seed = db.transaction(() => {
    for (const [id, fullName, position, department] of demoEmployees) {
      insertDemoDepartment.run(department, now);
      insertDemoEmployee.run(
        id,
        fullName,
        normalize(fullName),
        position,
        department,
        now,
      );
    }
  });

  seed();
}

export function closeDatabase(): void {
  if (db.open) db.close();
}