export type ActivityItem = {
  id: string;
  type: "success" | "info" | "warning" | "error" | string;
  title: string;
  message: string;
  time: string;
};

export function buildActivities(planName: string = "Starter"): ActivityItem[] {
  return [
    {
      id: "created",
      type: "success",
      title: "Account created",
      message: "Welcome to ERPEZ. Workspace successfully provisioned.",
      time: "Just now",
    },
    {
      id: "activated",
      type: "info",
      title: "Workspace active",
      message: `${planName} plan operational.`,
      time: "Just now",
    },
  ];
}
