export function RobotFace({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="14" y1="2" x2="14" y2="7" stroke="rgba(255,255,255,.75)" strokeWidth="1.4" strokeLinecap="round" />
      <circle className="antenna-dot" cx="14" cy="1.5" r="2" fill="#4ADE80" />
      <rect x="3" y="7" width="22" height="17" rx="4.5" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.65)" strokeWidth="1.4" />
      <circle className="robot-eye" cx="10" cy="15" r="2.8" fill="white" />
      <circle cx="10.9" cy="14.3" r="1.2" fill="#6D28D9" />
      <circle cx="11.4" cy="13.9" r="0.4" fill="white" opacity=".9" />
      <circle className="robot-eye robot-eye-r" cx="18" cy="15" r="2.8" fill="white" />
      <circle cx="18.9" cy="14.3" r="1.2" fill="#6D28D9" />
      <circle cx="19.4" cy="13.9" r="0.4" fill="white" opacity=".9" />
      <rect x="8.5" y="20.5" width="2.2" height="1.4" rx=".5" fill="rgba(255,255,255,.55)" />
      <rect x="12.9" y="20.5" width="2.2" height="1.4" rx=".5" fill="rgba(255,255,255,.55)" />
      <rect x="17.3" y="20.5" width="2.2" height="1.4" rx=".5" fill="rgba(255,255,255,.55)" />
      <rect x="11.5" y="24" width="5" height="2.5" rx="1.2" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.45)" strokeWidth="1" />
    </svg>
  );
}
