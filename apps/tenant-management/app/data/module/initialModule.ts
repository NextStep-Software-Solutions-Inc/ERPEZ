export type ModuleDef = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

export const initialModules: ModuleDef[] = [
  {
    id: "ams",
    title: "AMS - Account Management System",
    description:
      "Manage tenants, users, roles/permissions, offices, departments, suppliers, and regions. Enable single sign-on (SSO), role-based access control, automated notifications, and audit logging across the entire suite.",
    enabled: true,
  },
  {
    id: "pbms",
    title: "PBMS - Planning & Budget Management System",
    description:
      "Handle core functions of performance, budget preparation, and strategic planning. Identify and align performance goals, develop success indicators and rating scales, and accomplish commitment forms for unified organizational objectives.",
    enabled: true,
  },
  {
    id: "pms",
    title: "PMS - Procurement Management System",
    description:
      "Manage the entire purchasing process from purchase requests (PR) and RFQ bidding to BAC resolutions, Notice of Award (NOA), and purchase orders. Streamline procurement, ensure compliance, and maintain strong supplier relationships.",
    enabled: true,
  },
  {
    id: "sams",
    title: "SAMS - Supply and Assets Management System",
    description:
      "Comprehensive system to track, monitor, and manage both physical and digital assets throughout their entire lifecycle. Handle physical flow of supplies, manage inventory levels, and oversee maintenance, usage, and disposal.",
    enabled: true,
  },
];
