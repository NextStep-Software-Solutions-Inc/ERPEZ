export type ActivityItem = {
  id: string;
  type: "success" | "info" | "warning" | "error" | string;
  title: string;
  message: string;
  time: string;
};

export function buildActivities(): ActivityItem[] {
  return [
    {
      id: "created",
      type: "success",
      title: "Account created",
      message: "Welcome to ERP X21. Your trial has started.",
      time: "Just now",
    },
    {
      id: "activated",
      type: "info",
      title: "Trial activated",
      message: "Your 14-day free trial is now active.",
      time: "Just now",
    },
  ];
}
