export interface SuperAdminNavigationItem {
  title: string;
  url: string;
  permission?: string;
}

export interface SuperAdminNavigationGroup {
  title: string;
  url: string;
  items: SuperAdminNavigationItem[];
}

export const superAdminNavigationLinks: SuperAdminNavigationGroup[] = [
  {
    title: "PLATFORM",
    url: "#",
    items: [
      { title: "Overview", url: "super-admin/overview", permission: "platform.audit_logs.view" },
      { title: "Tenants", url: "super-admin/tenant-management", permission: "platform.tenants.view" },
      { title: "Platform Users", url: "super-admin/users", permission: "platform.users.view" },
      { title: "Platform Settings", url: "super-admin/settings", permission: "platform.settings.view" },
    ],
  },
];
