/** Функции хеширования и проверки пароля с использованием Argon2id. */
import argon2 from "argon2";

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19 * 1024, 
  timeCost: 2,
  parallelism: 1,
  hashLength: 32,
} as const;

/** Возвращает хеш; исходный пароль нигде не сохраняется */
export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

/** Проверяет пароль по ранее сохранённому хешу */
export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return argon2.verify(passwordHash, password);
}
