import { GrUserWorker } from "react-icons/gr";
import styles from "./Logo.module.css";

type LogoProps = {
  size?: "sm" | "md";
  label?: string;
  className?: string;
  labelClassName?: string;
};

const ICON_SIZE = { sm: 16, md: 18 } as const;
const MARK_SIZE = { sm: styles.markSm, md: styles.markMd } as const;

export function Logo({
  size = "md",
  label = "Список сотрудников",
  className,
  labelClassName,
}: LogoProps) {
  return (
    <span className={`${styles.logo} ${className ?? ""}`}>
      <span className={`${styles.mark} ${MARK_SIZE[size]}`} aria-hidden="true">
        <GrUserWorker size={ICON_SIZE[size]} />
      </span>
      {label && (
        <span className={`${styles.label} ${labelClassName ?? ""}`}>
          {label}
        </span>
      )}
    </span>
  );
}