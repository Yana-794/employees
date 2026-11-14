export interface PublicUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface UserRecord extends PublicUser {
  passwordHash: string;
}

/** Преобразует запись БД в безопасный объект API без passwordHash */
export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
}
