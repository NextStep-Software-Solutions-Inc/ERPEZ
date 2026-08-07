export const PLAN_MAP: Record<string, string> = {
  "0": "Starter",
  "1": "Professional",
  "2": "Enterprise",
  "3": "Business",
  "4": "Custom",
  "5": "Free",
};

export const STATUS_MAP: Record<string, string> = {
  "0": "Inactive",
  "1": "Active",
  "2": "Trial",
  "3": "Suspended",
};

export function planLabel(plan?: string | number | null) {
  if (plan === undefined || plan === null) return "Starter";
  const p = String(plan);
  if (Object.values(PLAN_MAP).includes(p)) return p; 
  return PLAN_MAP[p] ?? p;
}

export function statusLabel(status?: string | number | null) {
  if (status === undefined || status === null) return "Inactive";
  const s = String(status);
  if (Object.values(STATUS_MAP).includes(s)) return s;
  return STATUS_MAP[s] ?? s;
}

export const PLAN_OPTIONS = ["All", ...Object.values(PLAN_MAP)];
