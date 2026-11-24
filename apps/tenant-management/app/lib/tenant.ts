export const PLAN_MAP: Record<string, string> = {
  "0": "Unknown",
  "1": "Starter",
  "2": "Professional",
  "3": "Enterprise",
  "4": "On-Premise Sovereign",
  // Aliases for string names returned by API or legacy values
  Starter: "Starter",
  Professional: "Professional",
  Enterprise: "Enterprise",
  OnPremise: "On-Premise Sovereign",
  "On-Premise Sovereign": "On-Premise Sovereign",
  Pro: "Professional",
  Free: "Starter",
  Basic: "Starter",
};

export const STATUS_MAP: Record<string, string> = {
  "0": "Inactive",
  "1": "Active",
  "2": "Trial",
  "3": "Suspended",
  Inactive: "Inactive",
  Active: "Active",
  Trial: "Trial",
  Suspended: "Suspended",
};

export function planLabel(plan?: string | number | null) {
  if (plan === undefined || plan === null) return "Starter";
  const p = String(plan);
  if (PLAN_MAP[p]) return PLAN_MAP[p];
  if (Object.values(PLAN_MAP).includes(p)) return p;
  return p;
}

export function statusLabel(status?: string | number | null) {
  if (status === undefined || status === null) return "Inactive";
  const s = String(status);
  if (STATUS_MAP[s]) return STATUS_MAP[s];
  if (Object.values(STATUS_MAP).includes(s)) return s;
  return s;
}

export const PLAN_OPTIONS = ["All", "Starter", "Professional", "Enterprise", "On-Premise Sovereign"];
