export type QuickActionData = {
  id: "upgrade" | "license" | "downloads" | string;
  title: string;
  description?: string;
  iconKey: "upgrade" | "license" | "downloads" | string;
  button: { label: string; variant?: "outline" | undefined };
};

/**
 * Returns plain data only (no JSX) so this file can be a plain TS module.
 * Icons are resolved in the UI layer (overview.tsx) via an icon map.
 */
export function buildQuickActions(): QuickActionData[] {
  return [
    {
      id: "upgrade",
      title: "Upgrade Plan",
      description: "Unlock Enterprise features and remove limitations",
      iconKey: "crown",
      button: { label: "View Plans", variant: undefined },
    },
    {
      id: "license",
      title: "License Management",
      description: "Manage your licenses and activation keys",
      iconKey: "folder-key",
      button: { label: "Manage Licenses", variant: "outline" },
    },
    {
      id: "downloads",
      title: "Package Downloads",
      description: "Download deployment packages and updates",
      iconKey: "downloads",
      button: { label: "View Downloads", variant: "outline" },
    },
  ];
}
