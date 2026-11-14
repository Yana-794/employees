export interface Employee {
  id: string;
  fullName: string;
  position: string;
  department: string;
  createdAt: string;
}

/** Данные  для добавления нового сотрудника. */
export interface CreateEmployeeInput {
  fullName: string;
  position: string;
  department: string;
}

export interface EmployeeFilters {
  query?: string;
  department?: string;
}
