import { getAvatarColor } from "@/utils/avatar";

export function Avatar({ userId, initials, size = 30 }: { userId: string; initials: string; size?: number }) {
  const { bg, text } = getAvatarColor(userId);
  const r = Math.round(size * 0.3);
  return (
    <div style={{ width: size, height: size, borderRadius: r, background: bg, color: text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * .34), fontWeight: 700, flexShrink: 0, letterSpacing: "-.01em" }}>
      {initials}
    </div>
  );
}
