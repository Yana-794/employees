import { db } from "../config/database.js";
import type { ActiveSession } from "../models/session.model.js";

/** 
 * SQL-запросы для создания, поиска и отзыва пользовательских сессий 
 * */

type SessionRow = {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
};

export class SessionRepository {
  create(userId: string, tokenHash: string, expiresAt: string): void {
    db.prepare(`
      INSERT INTO auth_sessions (token_hash, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(tokenHash, userId, expiresAt, new Date().toISOString());
  }

  findActiveByTokenHash(tokenHash: string): ActiveSession | null {
    const row = db.prepare(`
      SELECT u.id, u.email, u.created_at, s.expires_at
      FROM auth_sessions AS s
      JOIN users AS u ON u.id = s.user_id
      WHERE s.token_hash = ?
        AND s.revoked_at IS NULL
        AND s.expires_at > ?
      LIMIT 1
    `).get(tokenHash, new Date().toISOString()) as SessionRow | undefined;

    if (!row) return null;

    return {
      user: {
        id: row.id,
        email: row.email,
        createdAt: row.created_at,
      },
      expiresAt: row.expires_at,
    };
  }

  revoke(tokenHash: string): void {
    db.prepare(`
      UPDATE auth_sessions
      SET revoked_at = ?
      WHERE token_hash = ? AND revoked_at IS NULL
    `).run(new Date().toISOString(), tokenHash);
  }
}

export const sessionRepository = new SessionRepository();