export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (search: string, department: string) =>
    [...employeeKeys.lists(), { search, department }] as const,
  departments: () => [...employeeKeys.all, "departments"] as const,
};
