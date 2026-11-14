import { Outlet, useNavigate } from "react-router";
import { LuUserRound, LuLogOut } from "react-icons/lu";
import { useAuth } from "@/features/auth/model/useAuth";
import { Logo } from "@/shared/ui/logo/Logo";
import styles from "./AppLayout.module.css";

export function AppLayout() {
  const navigate = useNavigate();
  const { user, logout, isLoggingOut } = useAuth();

  const localPart = user?.email?.split("@")[0] ?? "";
  const email = user?.email ?? "";
  const initial = (localPart[0] ?? "?").toUpperCase();

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <a
          className={styles.brand}
          href="/employees"
          onClick={(event) => {
            event.preventDefault();
            navigate("/employees");
          }}
        >
          <Logo
            size="sm"
            label="Сотрудники"
            labelClassName={styles.brandLabel}
          />
        </a>

        <div className={styles.userBlock}>
          <div className={styles.userCard}>
            <span className={styles.avatar} aria-hidden="true">
              <span className={styles.avatarInitial}>{initial}</span>
              <LuUserRound size={11} className={styles.avatarFallback} />
            </span>
            <div className={styles.userMeta}>
              <span className={styles.userName}>
                {localPart || "Пользователь"}
              </span>
              <span className={styles.userEmail} title={email}>
                {email}
              </span>
            </div>
          </div>

          <span className={styles.divider} aria-hidden="true" />

          <button
            className={styles.logoutButton}
            type="button"
            onClick={() => logout()}
            disabled={isLoggingOut}
            aria-label="Выйти из аккаунта"
            title="Выйти"
          >
            <span className={styles.logoutLabel}>
              {isLoggingOut ? "Выходим…" : "Выйти"}
            </span>
            <LuLogOut
              size={14}
              aria-hidden="true"
              className={styles.logoutIcon}
            />
          </button>
        </div>
      </header>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}