import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  requestPasswordReset,
  validateResetToken,
  submitNewPassword,
  getPasswordResetRequests,
  resetUserPassword,
} from "@/api/password-resets.api";

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  });
}

export function useValidateResetToken(token: string | null) {
  return useQuery({
    queryKey: ["password-resets", "validate", token],
    queryFn: () => validateResetToken(token as string),
    enabled: token !== null,
    retry: false,
  });
}

export function useSubmitNewPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      submitNewPassword(token, newPassword),
  });
}

export function usePasswordResetRequests() {
  return useQuery({
    queryKey: ["users", "password-reset-requests"],
    queryFn: getPasswordResetRequests,
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => resetUserPassword(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
