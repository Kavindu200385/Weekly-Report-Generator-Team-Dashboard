export function NavIcon({ id }: { id: string }) {
  const p = { width: 16, height: 16, display: "block" as const };
  switch (id) {
    case "report-form":
      return <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2.5" y="1.5" width="11" height="13" rx="2"/><path d="M5.5 6h5M5.5 8.5h5M5.5 11h3"/></svg>;
    case "report-history":
      return <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="5.5"/><path d="M8 5.5V8l2 2"/></svg>;
    case "dashboard":
      return <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5"/><rect x="9" y="9" width="5.5" height="5.5" rx="1.5"/></svg>;
    case "review-queue":
    case "manager-review":
      return <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3.5-4"/></svg>;
    case "user-mgmt":
      return <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="5.5" r="2.5"/><path d="M1.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5"/><circle cx="12" cy="5.5" r="1.8"/><path d="M13 14c0-2-1.4-3.5-3-3.5"/></svg>;
    case "projects":
      return <svg {...p} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 6h13v7.5a1 1 0 01-1 1h-11a1 1 0 01-1-1V6z"/><path d="M1.5 6l1.5-3h3.5l1 2.5"/></svg>;
    default:
      return null;
  }
}
