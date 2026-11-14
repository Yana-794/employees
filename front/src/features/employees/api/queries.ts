import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/shared/api/http/client";
import type {
  CreateEmployeePayload,
  DepartmentsResponse,
  EmployeesResponse,
} from "@/entities/employee/model/types";
import { employeeKeys } from "./queryKeys";

export function useEmployees(search: string, department: string) {
  return useQuery({
    queryKey: employeeKeys.list(search, department),
    queryFn: () =>
      httpClient.get<EmployeesResponse>("/employees", {
        query: { q: search, department },
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: employeeKeys.departments(),
    queryFn: () => httpClient.get<DepartmentsResponse>("/employees/departments"),
    staleTime: 5 * 60_000,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) =>
      httpClient.post<{ employee: unknown }>("/employees", { body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => httpClient.delete<void>(`/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}