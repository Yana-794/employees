import { Link, useLocation, useNavigate } from "react-router";
import { LoginForm } from "@/features/auth/ui/login-form/LoginForm";
import { AuthLayout } from "@/widgets/auth-layout/AuthLayout";
import styles from "./LoginPage.module.css";

type LocationState = { from?: { pathname?: string } };

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState | null)?.from?.pathname ?? "/employees";

  return (
    <AuthLayout
      title="С возвращением"
      subtitle="Войдите, чтобы просматривать и обновлять список сотрудников."
      footer={
        <p className={styles.switch}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      }
    >
      <LoginForm onSuccess={() => navigate(from, { replace: true })} />
    </AuthLayout>
  );
}