import { useMutation } from "@tanstack/react-query";
import { askAi, getTeamSummary } from "@/api/aiChat.api";

export function useAskAi() {
  return useMutation({ mutationFn: (question: string) => askAi(question) });
}

export function useTeamSummary() {
  return useMutation({ mutationFn: (week: string) => getTeamSummary(week) });
}
