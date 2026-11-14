import { useState, type FormEvent } from "react";
import { useLogin } from "@/features/auth/api/queries";
import { ApiError } from "@/shared/api/http/ApiError";
import styles from "./LoginForm.module.css";

type LoginFormProps = {
  onSuccess?: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const loginMutation = useLogin({ onSuccess });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isPending = loginMutation.isPending;
  const hasError = Boolean(loginMutation.error);

  const errorMessage = loginMutation.error instanceof ApiError
    ? loginMutation.error.message
    : loginMutation.error
      ? "Не удалось выполнить вход. Проверьте подключение к серверу."
      : "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    loginMutation.mutate({ email, password });
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      aria-busy={isPending || undefined}
      noValidate
    >
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Email</span>
        <input
          className={styles.input}
          type="email"
          autoComplete="email"
          placeholder="name@company.ru"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isPending}
          aria-invalid={hasError || undefined}
          required
        />
      </label>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>Пароль</span>
        <input
          className={styles.input}
          type="password"
          autoComplete="current-password"
          placeholder="Введите пароль"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isPending}
          aria-invalid={hasError || undefined}
          required
        />
      </label>

      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}

      <button
        className={styles.submit}
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}