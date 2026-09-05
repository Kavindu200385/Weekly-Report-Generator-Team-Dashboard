import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MQ } from "@/lib/breakpoints";

const SLIDES = [
  { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", headline: "Track team progress weekly", sub: "Submit structured reports in minutes — never miss what matters." },
  { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", headline: "Real-time team insights", sub: "Compliance rates, blockers and trends — updated as reports come in." },
  { url: "https://images.unsplash.com/photo-1622675363311-3e1904dc1885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", headline: "Streamlined review workflow", sub: "Approve, request changes, and keep every project moving forward." },
  { url: "https://images.unsplash.com/photo-1707157281599-d155d1da5b4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", headline: "Data-driven decisions", sub: "Version history, achievements, and blockers — all in one place." },
  { url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", headline: "Full team visibility", sub: "See every member, every project, every week — at a glance." },
];
const FEATURES = [
  { label: "Weekly reports",  color: "#7C3AED" },
  { label: "Version history", color: "#10B981" },
  { label: "Manager review",  color: "#3B82F6" },
  { label: "Team dashboard",  color: "#F59E0B" },
];

export function AuthLayout({ mode, children }: { mode: "login" | "register"; children: React.ReactNode }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [photoVisible, setPhotoVisible] = useState(true);
  const isMobile = useMediaQuery(MQ.mobile);

  useEffect(() => {
    const t = setInterval(() => {
      setPhotoVisible(false);
      setTimeout(() => { setPhotoIdx(i => (i + 1) % SLIDES.length); setPhotoVisible(true); }, 450);
    }, 4800);
    return () => clearInterval(t);
  }, []);

  const goToSlide = (i: number) => {
    setPhotoVisible(false);
    setTimeout(() => { setPhotoIdx(i); setPhotoVisible(true); }, 320);
  };

  const slide = SLIDES[photoIdx];

  const photoPanel = (
    <div key="photo" style={{ flex: "0 0 55%", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${slide.url})`, backgroundSize: "cover", backgroundPosition: "center", opacity: photoVisible ? 1 : 0, transition: "opacity 0.45s ease" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(155deg, rgba(12,8,35,.5) 0%, rgba(8,8,25,.35) 40%, rgba(4,4,14,.82) 100%)" }} />

      <div style={{ position: "absolute", top: 28, left: 30, display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,.16)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity=".55"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity=".55"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity=".9"/></svg>
        </div>
        <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-.01em" }}>Sitrep</span>
      </div>

      <div style={{ position: "absolute", top: 24, right: 22, display: "flex", flexDirection: "column", gap: 7 }}>
        {FEATURES.map(f => (
          <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.1)", backdropFilter: "blur(10px)", padding: "5px 12px 5px 8px", borderRadius: 20, border: "1px solid rgba(255,255,255,.14)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: f.color, flexShrink: 0, boxShadow: `0 0 6px ${f.color}88` }} />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,.88)", whiteSpace: "nowrap" }}>{f.label}</span>
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "56px 32px 30px", background: "linear-gradient(0deg, rgba(4,4,16,.88) 0%, transparent 100%)" }}>
        <div style={{ opacity: photoVisible ? 1 : 0, transition: "opacity 0.45s ease" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-.01em", lineHeight: 1.3, marginBottom: 8 }}>{slide.headline}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.68)", lineHeight: 1.65 }}>{slide.sub}</div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 18 }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goToSlide(i)} style={{ width: i === photoIdx ? 22 : 6, height: 6, borderRadius: 3, background: i === photoIdx ? "#fff" : "rgba(255,255,255,.32)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.35s ease" }} />
          ))}
        </div>
      </div>
    </div>
  );

  const formPanel = (
    <div key="form" style={{ flex: isMobile ? "1 1 auto" : "0 0 45%", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isMobile ? "24px 16px" : "36px 32px", overflowY: "auto" }}>
      <div style={{
        width: "100%", maxWidth: 380, background: "var(--surface)",
        border: "1px solid var(--border)", borderRadius: 20,
        boxShadow: "var(--shadow-md)", padding: isMobile ? "26px 20px 24px" : "36px 36px 32px",
      }}>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", overflow: isMobile ? "auto" : "hidden" }}>
      {isMobile ? formPanel : (mode === "login" ? <>{photoPanel}{formPanel}</> : <>{formPanel}{photoPanel}</>)}
    </div>
  );
}
