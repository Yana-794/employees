import { randomUUID } from "node:crypto";
import { db } from "../config/database.js";
import type { UserRecord } from "../models/user.model.js";

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
};

function mapUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export class UserRepository {
  findByEmail(email: string): UserRecord | null {
    const row = db.prepare(`
      SELECT id, email, password_hash, created_at
      FROM users
      WHERE email = ?
    `).get(email) as UserRow | undefined;

    return row ? mapUser(row) : null;
  }

  create(email: string, passwordHash: string): UserRecord | null {
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    const result = db.prepare(`
      INSERT INTO users (id, email, password_hash, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(email) DO NOTHING
    `).run(id, email, passwordHash, createdAt);

    if (result.changes === 0) return null;

    return { id, email, passwordHash, createdAt };
  }
}

export const userRepository = new UserRepository();