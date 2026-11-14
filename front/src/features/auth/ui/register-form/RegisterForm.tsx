import { useState, type FormEvent } from "react";
import { useRegister } from "@/features/auth/api/queries";
import { ApiError } from "@/shared/api/http/ApiError";
import styles from "./RegisterForm.module.css";

type RegisterFormProps = {
  onSuccess?: () => void;
};

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const registerMutation = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isPending = registerMutation.isPending;
  const hasError = Boolean(registerMutation.error);

  const errorMessage = registerMutation.error instanceof ApiError
    ? registerMutation.error.message
    : registerMutation.error
      ? "Не удалось зарегистрироваться. Проверьте подключение к серверу."
      : "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    registerMutation.mutate(
      { email, password },
      { onSuccess: () => onSuccess?.() },
    );
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
          autoComplete="new-password"
          placeholder="Не менее 12 символов"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isPending}
          aria-invalid={hasError || undefined}
          minLength={12}
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
        {isPending ? "Создаём аккаунт…" : "Зарегистрироваться"}
      </button>
    </form>
  );
}