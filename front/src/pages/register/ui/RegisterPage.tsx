import { Link, useNavigate } from "react-router";
import { RegisterForm } from "@/features/auth/ui/register-form/RegisterForm";
import { AuthLayout } from "@/widgets/auth-layout/AuthLayout";
import styles from "./RegisterPage.module.css";

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Регистрация"
      subtitle="Создайте аккаунт, чтобы получить доступ к списку сотрудников."
      footer={
        <p className={styles.switch}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      }
    >
      <RegisterForm
        onSuccess={() =>
          navigate("/login", { replace: true, state: { registered: true } })
        }
      />
    </AuthLayout>
  );
}