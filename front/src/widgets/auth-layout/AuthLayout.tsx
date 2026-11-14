import type { ReactNode } from "react";
import { Logo } from "@/shared/ui/logo/Logo";
import styles from "./AuthLayout.module.css";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.brandWrap}>
          <Logo size="sm" />
        </div>

        <p className={styles.eyebrow}>ЛИЧНЫЙ КАБИНЕТ</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{subtitle}</p>

        {children}
        {footer && <div className={styles.footer}>{footer}</div>}
      </section>
    </main>
  );
}