export function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="panel" style={style}>{children}</div>;
}

export function PH({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return <div className="ph"><span>{children}</span>{action}</div>;
}
