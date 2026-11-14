import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { LuChevronDown } from "react-icons/lu";
import {
  useCreateEmployee,
  useDepartments,
} from "@/features/employees/api/queries";
import { ApiError } from "@/shared/api/http/ApiError";
import { useSelectKeyDown } from "@/shared/lib/useSelectKeyDown";
import styles from "./EmployeeForm.module.css";

/** ФИО: только русские буквы, пробел и дефис */
const RUSSIAN_INPUT_DISALLOWED = /[^А-Яа-яЁё\s-]/g;
const RUSSIAN_INPUT_VALID = /^[А-Яа-яЁё][А-Яа-яЁё\s-]*$/;

/** Должность: любые символы, кроме цифр */
const POSITION_DIGITS = /\d/g;
const POSITION_HAS_DIGIT = /\d/;

export function EmployeeForm() {
  const createMutation = useCreateEmployee();
  const departmentsQuery = useDepartments();

  const departments = departmentsQuery.data?.departments ?? [];
  const hasDepartments = departments.length > 0;

  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [validationError, setValidationError] = useState("");

  const [selectOpen, setSelectOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectRootRef = useRef<HTMLDivElement>(null);
  const selectTriggerRef = useRef<HTMLButtonElement>(null);
  const selectListRef = useRef<HTMLUListElement>(null);

  const selectBaseId = useId();
  const listId = `${selectBaseId}-listbox`;
  const optionId = (index: number) => `${selectBaseId}-option-${index}`;
  const departmentLabelId = `${selectBaseId}-label`;

  const selectedIndex = departments.indexOf(department);

  useEffect(() => {
    if (hasDepartments && department && !departments.includes(department)) {
      setDepartment("");
    }
  }, [departments, department, hasDepartments]);

  useEffect(() => {
    if (!selectOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!selectRootRef.current?.contains(event.target as Node)) {
        setSelectOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [selectOpen]);

  useEffect(() => {
    if (!selectOpen || activeIndex < 0) return;
    const node = selectListRef.current?.children[activeIndex] as
      | HTMLElement
      | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [selectOpen, activeIndex]);

  function openSelect() {
    if (!departments.length) return;
    setSelectOpen(true);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }

  function closeSelect(focusTrigger = true) {
    setSelectOpen(false);
    setActiveIndex(-1);
    if (focusTrigger) selectTriggerRef.current?.focus();
  }

  function commitDepartment(index: number) {
    const next = departments[index];
    if (next === undefined) return;
    setDepartment(next);
    setValidationError("");
    closeSelect();
  }

  const handleSelectKeyDown = useSelectKeyDown({
    isOpen: selectOpen,
    itemsCount: departments.length,
    activeIndex,
    onOpen: openSelect,
    onClose: closeSelect,
    onActiveIndexChange: setActiveIndex,
    onCommit: commitDepartment,
  });

  function handleFullNameChange(event: ChangeEvent<HTMLInputElement>) {
    setFullName(event.target.value.replace(RUSSIAN_INPUT_DISALLOWED, ""));
    if (validationError) setValidationError("");
  }

  function handlePositionChange(event: ChangeEvent<HTMLInputElement>) {
    setPosition(event.target.value.replace(POSITION_DIGITS, ""));
    if (validationError) setValidationError("");
  }

  const mutationError =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.error
        ? "Не удалось сохранить сотрудника. Попробуйте ещё раз."
        : "";

  const errorMessage = validationError || mutationError;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasDepartments && !department.trim()) {
      setValidationError("Выберите отдел из списка");
      return;
    }

    if (!RUSSIAN_INPUT_VALID.test(fullName.trim())) {
      setValidationError(
        "ФИО может содержать только русские буквы, пробел и дефис",
      );
      return;
    }

    if (POSITION_HAS_DIGIT.test(position.trim())) {
      setValidationError("Должность не может содержать цифры");
      return;
    }

    setValidationError("");

    createMutation.mutate(
      {
        fullName: fullName.trim(),
        position: position.trim(),
        department: department.trim(),
      },
      {
        onSuccess: () => {
          setFullName("");
          setPosition("");
          setDepartment("");
        },
      },
    );
  }

  return (
    <section className={`panel ${styles.panel}`}>
      <div className={styles.panelHeading}>
        <div>
          <p className={`eyebrow ${styles.eyebrow}`}>НОВАЯ ЗАПИСЬ</p>
          <h2 className={styles.title}>Добавить сотрудника</h2>
        </div>
        <span className={styles.plusMark} aria-hidden="true">
          +
        </span>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>ФИО</span>
          <input
            className={styles.input}
            value={fullName}
            onChange={handleFullNameChange}
            placeholder="Иванов Иван Иванович"
            maxLength={150}
            autoComplete="off"
            spellCheck={false}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Должность</span>
          <input
            className={styles.input}
            value={position}
            onChange={handlePositionChange}
            placeholder="HR-специалист"
            maxLength={100}
            autoComplete="off"
            spellCheck={false}
            required
          />
        </label>

        <div className={styles.field}>
          <span className={styles.fieldLabel} id={departmentLabelId}>
            Отдел
          </span>

          {hasDepartments ? (
            <div className={styles.selectRoot} ref={selectRootRef}>
              <button
                type="button"
                ref={selectTriggerRef}
                className={[
                  styles.selectTrigger,
                  selectOpen ? styles.selectOpen : "",
                  validationError ? styles.selectInvalid : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={selectOpen}
                aria-controls={listId}
                aria-labelledby={departmentLabelId}
                aria-activedescendant={
                  selectOpen && activeIndex >= 0
                    ? optionId(activeIndex)
                    : undefined
                }
                onClick={() => (selectOpen ? closeSelect() : openSelect())}
                onKeyDown={handleSelectKeyDown}
              >
                <span
                  className={`${styles.selectValue} ${department ? "" : styles.selectPlaceholder}`}
                >
                  {department || "Выберите отдел"}
                </span>
                <LuChevronDown
                  size={16}
                  className={styles.selectChevron}
                  aria-hidden="true"
                />
              </button>

              {selectOpen && (
                <ul
                  id={listId}
                  ref={selectListRef}
                  className={styles.selectList}
                  role="listbox"
                  aria-labelledby={departmentLabelId}
                  tabIndex={-1}
                >
                  {departments.map((item, index) => {
                    const isSelected = item === department;
                    const isActive = index === activeIndex;
                    return (
                      <li
                        key={item}
                        id={optionId(index)}
                        role="option"
                        aria-selected={isSelected}
                        className={[
                          styles.selectOption,
                          isActive ? styles.selectOptionActive : "",
                          isSelected ? styles.selectOptionSelected : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => commitDepartment(index)}
                      >
                        <span className={styles.selectOptionLabel}>{item}</span>
                        {isSelected && (
                          <span
                            className={styles.selectCheck}
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <input
              className={styles.input}
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              placeholder="Например, ИТ"
              maxLength={100}
              required
            />
          )}
        </div>

        <button
          className={`button button-dark ${styles.addButton}`}
          type="submit"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Сохраняем…" : "Добавить"}
        </button>
      </form>

      {errorMessage && (
        <p className={`${styles.error} ${styles.errorInline}`} role="alert">
          {errorMessage}
        </p>
      )}
    </section>
  );
}