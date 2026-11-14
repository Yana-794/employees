
# Employee 

Full-stack справочник сотрудников: авторизация, список, поиск, фильтр по отделу,
добавление и удаление с подтверждением.

**Backend:** Node.js · TypeScript · Express · better-sqlite3 · Argon2id · cookie-сессии
**Frontend:** React · TypeScript · Vite · React Router · TanStack Query · CSS Modules
**Инфраструктура:** Docker Compose · Nginx

## Быстрый старт (Docker)

Нужен только Docker.

```bash
docker compose up --build
```

- Frontend — http://localhost:8080
- Backend health — http://localhost:3000/health

При первом запуске создаются схема SQLite, **5 демо-сотрудников** и справочник
отделов (HR, Аналитика, Поддержка, Разработка). Пользователей нет — откройте
фронтенд и зарегистрируйтесь.

### Сброс БД «с нуля»

```bash
docker compose down
docker volume rm -f employee-list-data
docker compose up --build
```

## Запуск без Docker

Node.js 20+.

```bash
# backend
cd back && npm install && npm run dev      # http://localhost:3000

# frontend (в отдельном терминале)
cd front && npm install && npm run dev     # http://localhost:5173
```

## Переменные окружения (backend)

| Переменная      | По умолчанию                  | Назначение                              |
| --------------- | ----------------------------- | --------------------------------------- |
| `NODE_ENV`      | `development`                 | `production` скрывает детали ошибок     |
| `PORT`          | `3000`                        | Порт HTTP-сервера                       |
| `DATABASE_PATH` | `./data/employee-list.sqlite` | Путь к файлу SQLite (`:memory:` — RAM)  |
| `COOKIE_SECURE` | `false`                       | `true` — cookie только по HTTPS         |

## API

Маршруты сотрудников защищены cookie-сессией.

| Метод    | Путь                          | Назначение                              |
| -------- | ----------------------------- | --------------------------------------- |
| `POST`   | `/api/auth/register`          | Регистрация                             |
| `POST`   | `/api/auth/login`             | Вход (ставит `employee_session`)        |
| `GET`    | `/api/auth/me`                | Текущий пользователь                    |
| `POST`   | `/api/auth/logout`            | Выход                                   |
| `GET`    | `/api/employees`              | Список (`?q=&department=`)              |
| `GET`    | `/api/employees/departments`  | Справочник отделов                      |
| `POST`   | `/api/employees`              | Добавить сотрудника                     |
| `DELETE` | `/api/employees/:id`          | Удалить сотрудника                      |

Ошибки — единым форматом:

```json
{ "error": { "code": "EMPLOYEE_NOT_FOUND", "message": "Сотрудник не найден" } }
```

## Правила ввода

- **ФИО** — только русские буквы, пробел, дефис. Блокируется на клиенте
  и проверяется на сервере (`400 INVALID_CHARACTERS`).
- **Должность** — любые символы, кроме цифр (`HR-специалист` — валидно).
- **Отдел** — из справочника; отдел не исчезает при удалении последнего
  сотрудника из него.

## Использованные ИИ-ассистенты

 Использлвались 2 модели: 

### ChatGPT

- Вёрстка и стили фронтенда: форма , панель списка, шапка , адаптив.
- Кастомный `select` (триггер + `role="listbox"`, клавиатура).
- Модалка подтверждения удаления.


### DeepSeek

- Backend-функции: `EmployeeRepository` (`findAll`, `findDepartments`, `create`,
  `deleteById`), транзакция «отдел + сотрудник».
- Миграция отделов в отдельную таблицу `departments`, seed и схема БД.
- Валидаторы: ФИО - только русские буквы, должность - без цифр.
- Единая обработка ошибок: `AppError` во всех слоях, `errorHandler`
  возвращает `{ error: { code, message } }`.

Все сгенерированные фрагменты прочитаны, прогнаны локально и в Docker,
поправлены под текущий код; финальные решения принимались вручную.

## Полезные команды

```bash
docker compose logs -f back
docker compose exec back sh
cd front && npm run build
cd back  && npm run build && npm start
```
```

