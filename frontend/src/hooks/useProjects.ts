import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  type ApiProject,
} from "@/api/projects.api";

export function useProjects(includeInactive = false) {
  return useQuery({
    queryKey: ["projects", includeInactive],
    queryFn: () => getProjects(includeInactive),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string }) => createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: number; name?: string; description?: string; isActive?: boolean }) =>
      updateProject(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      // Workload-by-project on the dashboard reflects active projects.
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export type { ApiProject };
