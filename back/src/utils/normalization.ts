/**
 * Нормализация строки для поиска.
 * Отдельное поле в SQLite позволяет искать кириллические ФИО без учёта регистра
 */
export function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("ru-RU");
}
