export type Employee = {
  id: number;
  fullName: string;
  position: string;
  department: string;
  createdAt: string;
};

export type CreateEmployeePayload = {
  fullName: string;
  position: string;
  department: string;
};

export type EmployeesResponse = {
  employees: Employee[];
};

export type DepartmentsResponse = {
  departments: string[];
};