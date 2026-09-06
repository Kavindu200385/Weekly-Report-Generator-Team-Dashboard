import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Role } from "@/types";
import {
  getUsers,
  updateUserRole,
  updateUserDetails,
  removeUser,
  getUserProfile,
  getPendingRegistrations,
  approveRegistration,
} from "@/api/users.api";

export function useUsers(filter: { role?: Role; includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ["users", filter],
    queryFn: () => getUsers(filter),
  });
}

export function useUserProfile(id: number | undefined) {
  return useQuery({
    queryKey: ["users", id, "profile"],
    queryFn: () => getUserProfile(id as number),
    enabled: id !== undefined,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) => updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Team-status/summary/section-view are keyed off the active-member roster.
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateUserDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, email }: { id: number; name: string; email: string }) =>
      updateUserDetails(id, { name, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // Names shown on team-status/activity-feed would otherwise stay stale.
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRemoveUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function usePendingRegistrations() {
  return useQuery({
    queryKey: ["users", "pending-registrations"],
    queryFn: getPendingRegistrations,
  });
}

export function useApproveRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) => approveRegistration(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      // A newly-approved member should show up on team-status right away.
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
