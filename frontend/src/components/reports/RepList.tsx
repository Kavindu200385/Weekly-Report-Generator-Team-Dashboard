import { uid } from "@/utils/id";
import { Btn } from "@/components/ui/Btn";

export interface RepListItem { id: string; description: string; isKeyFlag: boolean }

export function RepList({ items, onChange, placeholder, keyLabel, readOnly }: {
  items: RepListItem[];
  onChange?: (v: RepListItem[]) => void;
  placeholder: string; keyLabel: string; readOnly?: boolean;
}) {
  const setKey = (id: string, val: boolean) =>
    onChange?.(items.map(i => ({ ...i, isKeyFlag: i.id === id ? val : val ? false : i.isKeyFlag })));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(item => (
        <div key={item.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {readOnly
            ? <>{item.isKeyFlag && <span style={{ fontSize: 10, fontWeight: 800, color: "#92400E", background: "#FEF3C7", padding: "2px 8px", borderRadius: 12, flexShrink: 0 }}>KEY</span>}<span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>{item.description}</span></>
            : <>
                <input className="inp" value={item.description} onChange={e => onChange?.(items.map(i => i.id === item.id ? { ...i, description: e.target.value } : i))} placeholder={placeholder} style={{ flex: 1 }} />
                <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", whiteSpace: "nowrap", fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>
                  <input type="checkbox" checked={item.isKeyFlag} onChange={e => setKey(item.id, e.target.checked)} style={{ accentColor: "var(--accent)", width: 14, height: 14 }} />
                  {keyLabel}
                </label>
                <button onClick={() => onChange?.(items.filter(i => i.id !== item.id))} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 18, padding: "0 2px", lineHeight: 1 }}>×</button>
              </>}
        </div>
      ))}
      {!readOnly && <div><Btn variant="ghost" size="sm" onClick={() => onChange?.([...items, { id: uid(), description: "", isKeyFlag: false }])}>+ Add</Btn></div>}
    </div>
  );
}
