import { useEffect, useRef, useState } from "react";
import { RobotFace } from "@/components/ui/RobotFace";
import { useAskAi, useTeamSummary } from "@/hooks/useAiChat";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MQ } from "@/lib/breakpoints";

function thisMonday(): string {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

interface Message { role: "user" | "ai"; text: string; caption?: string }

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hi! I'm your Sitrep AI assistant. Ask me anything about team reports, blockers, achievements, or submission status — or tap \"Summarize this week\" below." }
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const askAi = useAskAi();
  const teamSummary = useTeamSummary();
  const loading = askAi.isPending || teamSummary.isPending;
  const isMobile = useMediaQuery(MQ.mobile);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  const send = async () => {
    const q = input.trim();
    if (!q) return;
    setMessages(ms => [...ms, { role: "user", text: q }]);
    setInput("");
    try {
      const res = await askAi.mutateAsync(q);
      setMessages(ms => [...ms, { role: "ai", text: res.answer, caption: `Based on: ${res.contextUsed}` }]);
    } catch (err) {
      setMessages(ms => [...ms, { role: "ai", text: err instanceof Error ? err.message : "Sorry, I couldn't process that." }]);
    }
  };

  const summarize = async () => {
    const week = thisMonday();
    setMessages(ms => [...ms, { role: "user", text: "Summarize this week" }]);
    try {
      const res = await teamSummary.mutateAsync(week);
      setMessages(ms => [...ms, { role: "ai", text: res.summary, caption: `Based on ${res.reportsAnalyzed} report${res.reportsAnalyzed !== 1 ? "s" : ""} for the week of ${week}` }]);
    } catch (err) {
      setMessages(ms => [...ms, { role: "ai", text: err instanceof Error ? err.message : "Sorry, I couldn't generate a summary." }]);
    }
  };

  return (
    <>
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200 }}>
        {open && (
          <div style={isMobile
            ? { position: "fixed", inset: 12, width: "auto", height: "auto", background: "#fff", borderRadius: 18, boxShadow: "0 8px 40px rgba(15,23,42,.18)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 201 }
            : { position: "absolute", bottom: 60, right: 0, width: 380, height: 520, background: "#fff", borderRadius: 18, boxShadow: "0 8px 40px rgba(15,23,42,.18)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#7C3AED 0%,#5B21B6 100%)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <RobotFace size={26} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Sitrep AI</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,.15)", padding: "2px 8px", borderRadius: 10 }}>
                    <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.9)" }}>LIVE</span>
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.65)", marginTop: 1 }}>Ask about your team</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,.15)", border: "none", color: "#fff", cursor: "pointer", width: 28, height: 28, borderRadius: 8, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "82%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: m.role === "user" ? "linear-gradient(135deg,#7C3AED,#5B21B6)" : "var(--raised)",
                    color: m.role === "user" ? "#fff" : "var(--text-1)",
                    fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line",
                  }}>{m.text}</div>
                  {m.caption && <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 4, maxWidth: "82%" }}>{m.caption}</div>}
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{ padding: "10px 14px", borderRadius: "16px 16px 16px 4px", background: "var(--raised)", fontSize: 20, letterSpacing: 2 }}>
                    <span style={{ animation: "pulse 1s infinite" }}>···</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: "8px 14px 0" }}>
              <button onClick={summarize} disabled={loading} style={{ fontSize: 11.5, fontWeight: 700, color: "var(--accent)", background: "var(--accent-bg)", border: "none", borderRadius: 20, padding: "6px 14px", cursor: loading ? "not-allowed" : "pointer" }}>
                ✨ Summarize this week
              </button>
            </div>
            <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, marginTop: 8 }}>
              <input
                className="inp" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask anything…" style={{ flex: 1, fontSize: 13, minHeight: 44 }}
              />
              <button onClick={send} disabled={!input.trim() || loading} style={{ background: "var(--gradient)", border: "none", color: "#fff", borderRadius: 10, padding: "0 16px", minHeight: 44, cursor: input.trim() ? "pointer" : "not-allowed", opacity: input.trim() ? 1 : .45, fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>
                Send
              </button>
            </div>
          </div>
        )}
        <button onClick={() => setOpen(o => !o)} style={{
          width: 58, height: 58, borderRadius: "50%",
          background: open ? "linear-gradient(135deg,#4C1D95,#3B0764)" : "linear-gradient(135deg,#7C3AED,#5B21B6)",
          border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 24px rgba(124,58,237,.55)", transition: "background .2s, transform .15s",
          position: "relative",
        }}>
          {!open && <><span className="chat-ring" /><span className="chat-ring-2" /></>}
          {!open && (
            <span className="live-dot" style={{ position: "absolute", top: 4, right: 5, width: 10, height: 10, borderRadius: "50%", background: "#4ADE80", border: "2px solid #5B21B6", zIndex: 1 }} />
          )}
          {open
            ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M4 4l12 12M16 4L4 16"/></svg>
            : <RobotFace size={32} />}
        </button>
      </div>
    </>
  );
}
