import type { Status } from "@/types";

export const SC: Record<Status, { label: string; bg: string; fg: string; dot: string }> = {
  "draft":            { label: "Draft",           bg: "#F1F5F9", fg: "#475569", dot: "#94A3B8" },
  "submitted":        { label: "Submitted",        bg: "#EFF6FF", fg: "#1D4ED8", dot: "#3B82F6" },
  "needs_correction": { label: "Needs correction", bg: "#FEF3C7", fg: "#92400E", dot: "#F59E0B" },
  "approved":         { label: "Approved",         bg: "#D1FAE5", fg: "#065F46", dot: "#10B981" },
};
