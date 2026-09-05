export const AVATAR_COLORS = [
  { bg: "#7C3AED", text: "#fff" },
  { bg: "#0EA5E9", text: "#fff" },
  { bg: "#10B981", text: "#fff" },
  { bg: "#F59E0B", text: "#fff" },
  { bg: "#EF4444", text: "#fff" },
  { bg: "#EC4899", text: "#fff" },
];

// Deterministic per-user color derived from the id itself (no longer
// dependent on a mock USERS list index, since users now come from the
// real backend).
export function getAvatarColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
