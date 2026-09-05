import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTeamReports } from "@/api/reports.api";
import type { ReportFilter } from "@/api/reports.api";
import { createReview, getReportReviews, type ReviewAction } from "@/api/reviews.api";

export function useTeamReports(filter: ReportFilter = {}) {
  return useQuery({
    queryKey: ["reports", "team", filter],
    queryFn: () => getTeamReports(filter),
  });
}

export function useReportReviews(reportId: number | undefined) {
  return useQuery({
    queryKey: ["reports", reportId, "reviews"],
    queryFn: () => getReportReviews(reportId as number),
    enabled: reportId !== undefined,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, action, comment }: { reportId: number; action: ReviewAction; comment?: string }) =>
      createReview(reportId, { action, comment }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["reports", vars.reportId] });
    },
  });
}
