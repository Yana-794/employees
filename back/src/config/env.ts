/**
 * Централизованное чтение переменных окружения.
 * dotenv загружает значения из .env при локальном запуске;
 * внутри Docker значения передаются через environment в Compose.
 */
import "dotenv/config";

function readNumber(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Переменная ${name} должна быть положительным целым числом`);
  }

  return parsed;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: readNumber("PORT", 3000),
  databasePath: process.env.DATABASE_PATH ?? "./data/employee-list.sqlite",
  cookieSecure: readBoolean("COOKIE_SECURE", false),
};
