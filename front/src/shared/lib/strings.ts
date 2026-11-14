export function safeStr(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function safeTrim(value: unknown): string {
  return safeStr(value).trim();
}