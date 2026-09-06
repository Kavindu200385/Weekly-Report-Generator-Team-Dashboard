import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTeamReports } from "@/api/reports.api";
import type { ReportFilter } from "@/api/reports.api";
import { createReview, getReportReviews, type ReviewAction } from "@/api/reviews.api";

export function useTeamReports(filter: ReportFilter = {}) {
  return useQuery({
    queryKey: ["reports", "team", filter],
    queryFn: () => getTeamReports(filter),
    // Mutation-triggered invalidation only reaches the browser tab that made
    // the change — a manager watching this in one session won't otherwise
    // learn a different member just submitted from their own session. Poll
    // so a fresh submission shows up within a few seconds either way.
    refetchInterval: 15000,
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
      // Approving/requesting changes changes the underlying report data the
      // dashboard's summary/team-status/workload/section-view are derived
      // from — without this, the dashboard stays stale until a full reload.
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
