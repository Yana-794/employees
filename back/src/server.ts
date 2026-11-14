import { app } from "./app.js";
import { closeDatabase, initDatabase } from "./config/database.js";
import { env } from "./config/env.js";

initDatabase();

const server = app.listen(env.port, "0.0.0.0", () => {
  console.log(`Employee API запущен на порту ${env.port}`);
});

function shutdown(signal: string): void {
  console.log(`Получен ${signal}. Завершаем работу...`);

  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
