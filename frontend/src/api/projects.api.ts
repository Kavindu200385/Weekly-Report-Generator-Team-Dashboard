// Real NestJS ProjectsModule endpoints — replaces the earlier mock array
// held in frontend/src/api/mockData.ts's PROJECTS_INIT.
import { client, normalizeApiError } from "@/api/client";

export interface ApiProject {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface DeleteProjectResult {
  project: ApiProject;
  activeReportsAffected: number;
}

export async function getProjects(includeInactive = false): Promise<ApiProject[]> {
  try {
    const { data } = await client.get<ApiProject[]>("/projects", {
      params: includeInactive ? { includeInactive: "true" } : undefined,
    });
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function createProject(input: { name: string; description?: string }): Promise<ApiProject> {
  try {
    const { data } = await client.post<ApiProject>("/projects", input);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function updateProject(
  id: number,
  input: { name?: string; description?: string; isActive?: boolean },
): Promise<ApiProject> {
  try {
    const { data } = await client.patch<ApiProject>(`/projects/${id}`, input);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export async function deleteProject(id: number): Promise<DeleteProjectResult> {
  try {
    const { data } = await client.delete<DeleteProjectResult>(`/projects/${id}`);
    return data;
  } catch (err) {
    throw normalizeApiError(err);
  }
}
