export interface SuperAdminNavigationItem {
  title: string;
  url: string;
  icon?: string;
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
      { title: "Overview", url: "super-admin/overview", icon: "LayoutDashboard", permission: "platform.audit_logs.view" },
      { title: "Tenants", url: "super-admin/tenant-management", icon: "Building2", permission: "platform.tenants.view" },
      { title: "Inquiries & Leads", url: "super-admin/inquiries", icon: "Inbox", permission: "platform.settings.view" },
      { title: "Platform Users", url: "super-admin/users", icon: "Users", permission: "platform.users.view" },
      { title: "Platform Settings", url: "super-admin/settings", icon: "Settings", permission: "platform.settings.view" },
    ],
  },
];
