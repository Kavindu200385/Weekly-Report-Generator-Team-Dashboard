import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Role } from "@/types";
import { createInvite, getPendingInvites, revokeInvite, validateInvite } from "@/api/invites.api";

export function usePendingInvites() {
  return useQuery({
    queryKey: ["invites", "pending"],
    queryFn: getPendingInvites,
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; role: Role }) => createInvite(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invites"] }),
  });
}

export function useRevokeInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => revokeInvite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invites"] }),
  });
}

export function useValidateInvite(token: string | null) {
  return useQuery({
    queryKey: ["invites", "validate", token],
    queryFn: () => validateInvite(token as string),
    enabled: token !== null,
    retry: false,
  });
}
