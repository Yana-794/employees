import { useState } from "react";
import { useDepartments, useEmployees } from "@/features/employees/api/queries";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue"
import { EmployeeForm } from "@/features/employees/ui/employee-form/EmployeeForm";
import { EmployeesDirectory } from "@/features/employees/ui/employees-directory/EmployeesDirectory";
import styles from "./EmployeesPage.module.css";

export function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");

  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const employeesQuery = useEmployees(debouncedSearch, department);
  const departmentsQuery = useDepartments();

  const employees = employeesQuery.data?.employees ?? [];
  const departments = departmentsQuery.data?.departments ?? [];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Сотрудники</h1>
      </header>

      <EmployeeForm />

      <EmployeesDirectory
        employees={employees}
        departments={departments}
        isLoading={employeesQuery.isLoading}
        isFetching={employeesQuery.isFetching}
        isError={employeesQuery.isError}
        search={search}
        onSearchChange={setSearch}
        department={department}
        onDepartmentChange={setDepartment}
      />

      <footer className={styles.footer}>
        Список сотрудников · Данные сохраняются в SQLite
      </footer>
    </div>
  );
}