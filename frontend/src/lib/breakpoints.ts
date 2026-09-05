export const BREAKPOINTS = { sm: 640, lg: 1024, xl: 1440 } as const;

export const MQ = {
  mobile: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  belowLg: `(max-width: ${BREAKPOINTS.lg - 1}px)`,
  laptopUp: `(min-width: ${BREAKPOINTS.lg}px)`,
} as const;
