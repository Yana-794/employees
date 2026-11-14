import { LuTrash2 } from "react-icons/lu";
import { safeStr, safeTrim } from "@/shared/lib/strings";
import type { Employee } from "@/entities/employee/model/types";
import styles from "./EmployeeRow.module.css";

const AVATAR_MODIFIERS = [
  "",
  styles.avatar1,
  styles.avatar2,
  styles.avatar3,
  styles.avatar4,
];

type EmployeeRowProps = {
  employee: Employee;
  index: number;
  onDelete?: (employee: Employee) => void;
};

export function EmployeeRow({ employee, index, onDelete }: EmployeeRowProps) {
  const fullName = safeTrim(employee.fullName);
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

  const modifier = AVATAR_MODIFIERS[index % AVATAR_MODIFIERS.length];
  const avatarClass = modifier ? `${styles.avatar} ${modifier}` : styles.avatar;

  return (
    <article className={styles.row}>
      <div className={avatarClass} aria-hidden="true">
        {initials || "?"}
      </div>
      <div className={styles.main}>
        <strong className={styles.name}>{fullName || "Без имени"}</strong>
        <span className={styles.position}>{safeStr(employee.position)}</span>
      </div>
      <span className={styles.tag}>{safeStr(employee.department)}</span>

      {onDelete && (
        <button
          type="button"
          className={styles.deleteButton}
          onClick={() => onDelete(employee)}
          aria-label={`Удалить сотрудника ${fullName || "без имени"}`}
          title="Удалить"
        >
          <LuTrash2 size={15} aria-hidden="true" />
        </button>
      )}
    </article>
  );
}