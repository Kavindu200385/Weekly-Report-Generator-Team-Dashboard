export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-1)" }}>{title}</span>
          <button onClick={onClose} style={{ background: "var(--raised)", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 18, lineHeight: 1, width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
