import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReport,
  updateReport,
  submitReport,
  getMyReports,
  getReport,
  getReportVersions,
  getReportVersion,
  type ReportFilter,
  type CreateReportInput,
  type UpdateReportInput,
} from "@/api/reports.api";

export function useMyReports(filter: ReportFilter = {}) {
  return useQuery({
    queryKey: ["reports", "me", filter],
    queryFn: () => getMyReports(filter),
  });
}

export function useReport(id: number | undefined) {
  return useQuery({
    queryKey: ["reports", id],
    queryFn: () => getReport(id as number),
    enabled: id !== undefined,
  });
}

export function useReportVersions(id: number | undefined) {
  return useQuery({
    queryKey: ["reports", id, "versions"],
    queryFn: () => getReportVersions(id as number),
    enabled: id !== undefined,
  });
}

export function useReportVersion(id: number | undefined, versionId: number | null) {
  return useQuery({
    queryKey: ["reports", id, "versions", versionId],
    queryFn: () => getReportVersion(id as number, versionId as number),
    enabled: id !== undefined && versionId !== null,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReportInput) => createReport(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reports"] }),
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: number } & UpdateReportInput) => updateReport(id, input),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["reports", vars.id] });
    },
  });
}

export function useSubmitReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => submitReport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["reports", id] });
    },
  });
}
