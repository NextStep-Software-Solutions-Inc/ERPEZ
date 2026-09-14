export type CardValue =
  | { type: "text"; value: string }
  | { type: "badge"; label: string; color?: string };

export type CardItem = {
  id: string;
  title: string;
  value: CardValue;
  hint?: string;
  actionKey?: string;
  iconKey?: string;
};

/**
 * Factory to build dashboard cards from dynamic values.
 * Keeps UI components out of the plain data layer.
 */
export function buildCards({
  licenseDays,
  licenseDisplay,
  planName,
  statusLabel,
  statusColor,
  lastUpdated,
  licenseHint,
}: {
  licenseDays?: number | null;
  licenseDisplay?: string;
  planName: string;
  statusLabel: string;
  statusColor?: string;
  lastUpdated: string;
  licenseHint?: string;
}): CardItem[] {
  const displayLicense = licenseDisplay ?? (licenseDays != null ? `${licenseDays} days` : "Cloud SaaS");
  const defaultHint = licenseDays != null
    ? (licenseDays > 30 ? "License active" : "License expiring soon")
    : "Active cloud subscription";

  return [
    {
      id: "license",
      title: licenseDays != null ? "License Expiry" : "License Tier",
      value: { type: "text", value: displayLicense },
      hint: licenseHint ?? defaultHint,
      iconKey: "calendar",
    },
    {
      id: "plan",
      title: "Current Plan",
      value: { type: "text", value: planName },
      actionKey: "upgrade",
      iconKey: "badge",
    },
    {
      id: "status",
      title: "Status",
      value: {
        type: "badge",
        label: statusLabel,
        color: statusColor ?? "green",
      },
      hint: "Tenant is operational",
      iconKey: "circle",
    },
    {
      id: "updated",
      title: "Last Updated",
      value: { type: "text", value: lastUpdated },
      hint: "System sync completed",
      iconKey: "clock",
    },
  ];
}
