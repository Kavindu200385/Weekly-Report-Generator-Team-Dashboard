export function Sm({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <span style={{ fontSize: 12, color: muted ? "var(--text-3)" : "var(--text-2)" }}>{children}</span>;
}
export const Mono = Sm;
