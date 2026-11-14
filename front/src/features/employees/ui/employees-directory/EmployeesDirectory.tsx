import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { LuSearch, LuChevronDown, LuCheck } from "react-icons/lu";
import type { Employee } from "@/entities/employee/model/types";
import { ApiError } from "@/shared/api/http/ApiError";
import { useDeleteEmployee } from "@/features/employees/api/queries";
import { safeTrim } from "@/shared/lib/strings";
import { useSelectKeyDown } from "@/shared/lib/useSelectKeyDown";
import { EmployeeRow } from "../employee-row/EmployeeRow";
import styles from "./EmployeesDirectory.module.css";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog/ConfirmDialog";

type EmployeesDirectoryProps = {
  employees: Employee[];
  departments: string[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
};

function pluralizeEmployees(total: number): string {
  const word =
    total === 1 ? "сотрудник"
    : total >= 2 && total <= 4 ? "сотрудника"
    : "сотрудников";
  return `${total} ${word}`;
}

export function EmployeesDirectory({
  employees,
  departments,
  isLoading,
  isFetching,
  isError,
  search,
  onSearchChange,
  department,
  onDepartmentChange,
}: EmployeesDirectoryProps) {
  const totalLabel = useMemo(
    () => pluralizeEmployees(employees.length),
    [employees.length],
  );

  const hasActiveFilters = search.trim() !== "" || department !== "";

  const statusText = isLoading
    ? "Загружаем…"
    : isFetching
      ? `${totalLabel} · обновляем…`
      : totalLabel;

  const handleClearFilters = () => {
    onSearchChange("");
    onDepartmentChange("");
  };

  const departmentOptions = useMemo(
    () => [
      { value: "", label: "Все отделы" },
      ...departments.map((item) => ({ value: item, label: item })),
    ],
    [departments],
  );

  const [selectOpen, setSelectOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectRootRef = useRef<HTMLDivElement>(null);
  const selectTriggerRef = useRef<HTMLButtonElement>(null);
  const selectListRef = useRef<HTMLUListElement>(null);

  const selectBaseId = useId();
  const listId = `${selectBaseId}-listbox`;
  const optionId = (index: number) => `${selectBaseId}-option-${index}`;
  const departmentLabelId = `${selectBaseId}-label`;

  const selectedIndex = departmentOptions.findIndex(
    (option) => option.value === department,
  );
  const selectedOption =
    selectedIndex >= 0 ? departmentOptions[selectedIndex] : null;

  useEffect(() => {
    if (!selectOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!selectRootRef.current?.contains(event.target as Node)) {
        setSelectOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, [selectOpen]);

  useEffect(() => {
    if (!selectOpen || activeIndex < 0) return;
    const node = selectListRef.current?.children[activeIndex] as
      | HTMLElement
      | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [selectOpen, activeIndex]);

  function openSelect() {
    setSelectOpen(true);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }

  function closeSelect(focusTrigger = true) {
    setSelectOpen(false);
    setActiveIndex(-1);
    if (focusTrigger) selectTriggerRef.current?.focus();
  }

  function commitDepartment(index: number) {
    const next = departmentOptions[index];
    if (!next) return;
    onDepartmentChange(next.value);
    closeSelect();
  }

  const handleSelectKeyDown = useSelectKeyDown({
    isOpen: selectOpen,
    itemsCount: departmentOptions.length,
    activeIndex,
    onOpen: openSelect,
    onClose: closeSelect,
    onActiveIndexChange: setActiveIndex,
    onCommit: commitDepartment,
  });

  const deleteMutation = useDeleteEmployee();
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);

  const deleteError = deleteMutation.error
    ? deleteMutation.error instanceof ApiError
      ? deleteMutation.error.message
      : "Не удалось удалить сотрудника. Попробуйте ещё раз."
    : "";

  function handleRequestDelete(employee: Employee) {
    deleteMutation.reset();
    setPendingDelete(employee);
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    deleteMutation.mutate(String(pendingDelete.id), {
      onSuccess: () => setPendingDelete(null),
    });
  }

  function handleCancelDelete() {
    if (deleteMutation.isPending) return;
    setPendingDelete(null);
    deleteMutation.reset();
  }

  const pendingFullName = pendingDelete
    ? safeTrim(pendingDelete.fullName) || "Без имени"
    : "";

  return (
    <section className={`panel ${styles.panel}`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Сотрудники</h2>
          <p className={styles.subtitle} aria-live="polite">
            {statusText}
          </p>
        </div>
        <span className={styles.count}>{departments.length} отделов</span>
      </div>

      <div className={styles.filters}>
        <label className={styles.searchField}>
          <span className="sr-only">Поиск по ФИО</span>
          <LuSearch
            size={16}
            className={styles.searchIcon}
            aria-hidden="true"
          />
          <input
            type="search"
            className={styles.searchInput}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Поиск по ФИО…"
            autoComplete="off"
          />
        </label>

        <div className={styles.selectField}>
          <span id={departmentLabelId} className="sr-only">
            Фильтр по отделу
          </span>

          <div className={styles.selectRoot} ref={selectRootRef}>
            <button
              type="button"
              ref={selectTriggerRef}
              className={[
                styles.selectTrigger,
                selectOpen ? styles.selectOpen : "",
                department ? styles.selectActiveValue : "",
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
              <span className={styles.selectValue}>
                {selectedOption?.label ?? "Все отделы"}
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
                {departmentOptions.map((option, index) => {
                  const isSelected = option.value === department;
                  const isActive = index === activeIndex;
                  return (
                    <li
                      key={option.value || "__all__"}
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
                      <span className={styles.selectOptionLabel}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <LuCheck
                          size={14}
                          className={styles.selectCheck}
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loader}>
          <span className={styles.spinner} aria-hidden="true" />
          <span>Загружаем список…</span>
        </div>
      ) : isError ? (
        <div className={`${styles.empty} ${styles.error}`}>
          <strong>Не удалось загрузить список</strong>
          <span>Проверьте соединение и обновите страницу.</span>
        </div>
      ) : employees.length === 0 ? (
        hasActiveFilters ? (
          <div className={styles.empty}>
            <LuSearch size={26} className={styles.emptyIcon} aria-hidden="true" />
            <strong>Ничего не найдено</strong>
            <span>Попробуйте изменить запрос или выбрать другой отдел.</span>
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClearFilters}
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className={styles.empty}>
            <strong>Пока нет сотрудников</strong>
            <span>Добавьте первого через форму выше.</span>
          </div>
        )
      ) : (
        <div className={styles.list}>
          {employees.map((employee, index) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              index={index}
              onDelete={handleRequestDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Удалить сотрудника?"
        description={
          <>
            <strong>{pendingFullName}</strong> будет удалён без возможности
            восстановления.
          </>
        }
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        busy={deleteMutation.isPending}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </section>
  );
}