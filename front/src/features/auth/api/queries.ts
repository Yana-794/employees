import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { ApiError, httpClient } from "@/shared/api/http/client";
import { authKeys } from "./queryKeys";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/entities/user/model/types";

export function useMe() {
  return useQuery<AuthResponse | null>({
    queryKey: authKeys.me(),
    queryFn: async () => {
      try {
        return await httpClient.get<AuthResponse>("/auth/me");
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      httpClient.post<AuthResponse>("/auth/login", { body: payload }),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data);
      options?.onSuccess?.();
    },
  });
}

export function useRegister(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      httpClient.post<{ user: User }>("/auth/register", { body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      options?.onSuccess?.();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => httpClient.post<void>("/auth/logout"),
    onSettled: () => {
      queryClient.setQueryData(authKeys.me(), null);
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== "auth",
      });
      navigate("/login", { replace: true });
    },
  });
}
