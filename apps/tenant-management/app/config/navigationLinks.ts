export interface NavigationItem {
  title: string;
  url: string;
  icon: string;
  permission?: string;
  hiddenForPlans?: string[];
}

export interface NavigationGroup {
  title: string;
  url: string;
  items: NavigationItem[];
}

export const navigationLinks: NavigationGroup[] = [
  {
    title: "WORKSPACE",
    url: "#",
    items: [
      { title: "Overview", url: "overview", icon: "LayoutDashboard", permission: "tenant.workspace.view" },
      { title: "Members", url: "tenant-member", icon: "Users", permission: "tenant.members.view" },
      { title: "Roles & Permissions", url: "roles", icon: "Shield", permission: "tenant.roles.view" },
    ],
  },
  {
    title: "ERP",
    url: "#",
    items: [
      { title: "Modules", url: "module", icon: "Puzzle", permission: "tenant.modules.view" },
      { 
        title: "Package Download", 
        url: "package-download", 
        icon: "Download", 
        permission: "tenant.workspace.view",
        hiddenForPlans: ["Starter"],
      },
    ],
  },
  {
    title: "ADMINISTRATION",
    url: "#",
    items: [
      { title: "Subscription", url: "subscription", icon: "Settings", permission: "tenant.subscriptions.view" },
      { title: "Billing", url: "billing", icon: "WalletMinimal", permission: "tenant.billing.view" },
      { title: "Invoices", url: "invoice", icon: "NotepadText", permission: "tenant.invoices.view" },
      { title: "License", url: "license-management", icon: "FolderKey", permission: "tenant.licenses.view" },
    ],
  },
];
