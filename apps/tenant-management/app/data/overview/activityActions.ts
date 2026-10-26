export type ActivityItem = {
  id: string;
  type: "success" | "info" | "warning" | "error" | string;
  title: string;
  message: string;
  time: string;
};

export function buildActivities(
  planName: string = "Starter",
  options?: {
    startDate?: string;
    isDisabled?: boolean;
    tenantName?: string;
  }
): ActivityItem[] {
  const formattedStart = options?.startDate
    ? new Date(options.startDate).toLocaleDateString()
    : "Configured";

  return [
    {
      id: "created",
      type: "success",
      title: "Workspace provisioned",
      message: options?.tenantName
        ? `${options.tenantName} workspace registered on ERPEZ.`
        : "Welcome to ERPEZ. Workspace provisioned.",
      time: formattedStart,
    },
    {
      id: "activated",
      type: options?.isDisabled ? "warning" : "info",
      title: options?.isDisabled ? "Workspace suspended" : "Subscription status",
      message: options?.isDisabled
        ? "Workspace access is currently disabled by an administrator."
        : `${planName} plan assigned to this workspace.`,
      time: options?.isDisabled ? "Suspended" : "Active",
    },
  ];
}
