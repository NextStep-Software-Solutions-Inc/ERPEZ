export interface PlanItem {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  button: string;
  buttonVariant: "default" | "secondary";
  popular?: boolean;
  annualPrice?: string;
  annualPriceSave?: string;
  monthlyAmountCents?: number;
  annualAmountCents?: number;
  deployment?: "saas" | "on-premise";
  badge?: string;
  tier?: "Starter" | "Professional" | "Enterprise";
}

export const saasPlans: PlanItem[] = [
  {
    name: "Starter",
    tier: "Starter",
    price: "Team Scope",
    period: "Customized for up to 10 users, AMS & PBMS",
    description: "Core account, user, planning, and budget management for small teams",
    deployment: "saas",
    features: [
      "Up to 10 users & 1 tenant",
      "AMS (Account Management System)",
      "PBMS (Planning and Budget Management System)",
      "Role-based access control & tenant management",
      "ERPez Cloud multi-tenant workspace",
      "Standard support & platform updates",
    ],
    button: "Request Starter Quote",
    buttonVariant: "default",
  },
  {
    name: "Professional",
    tier: "Professional",
    price: "Business Scale",
    period: "Customized for procurement, planning & 50 users",
    description: "Full procurement, budgeting, and purchasing suite for growing businesses",
    deployment: "saas",
    features: [
      "Up to 50 users & 1 tenant",
      "Everything in Starter (AMS + PBMS), plus:",
      "PMS (Procurement Management System)",
      "Purchase requests, bidding & purchase orders",
      "Abstract of Bids (AOB) & BAC award workflows",
    ],
    button: "Request Business Quote",
    buttonVariant: "secondary",
    popular: true,
  },
  {
    name: "SaaS Enterprise",
    tier: "Enterprise",
    price: "Enterprise Scale",
    period: "Institutional agreement & dedicated DB",
    description: "Full ERP suite with dedicated database isolation and multi-branch governance",
    deployment: "saas",
    features: [
      "Unlimited users & multiple subsidiaries",
      "Full ERP Suite: AMS + PBMS + PMS",
      "Dedicated Isolated Operational Database",
      "Enterprise role hierarchy & multi-branch oversight",
      "Dedicated onboarding & implementation guidance",
    ],
    button: "Talk to Enterprise Sales",
    buttonVariant: "default",
  },
];

export const onPremisePlans: PlanItem[] = [
  {
    name: "On-Premise Foundation",
    tier: "Starter",
    price: "Foundation Scope",
    period: "Self-hosted deployment for up to 25 users (AMS + PBMS)",
    description: "Self-hosted deployment for private local server infrastructure",
    deployment: "on-premise",
    badge: "Self-Hosted Ready",
    features: [
      "Up to 25 users & 1 local tenant database",
      "AMS (Account Management System)",
      "PBMS (Planning and Budget Management System)",
      "Cryptographic HMAC-SHA256 license key verification",
      "Localhost / internal IP domain lock",
      "Self-service license key generation & .lic download",
    ],
    button: "Request Foundation Quote",
    buttonVariant: "default",
  },
  {
    name: "On-Premise Professional",
    tier: "Professional",
    price: "Enterprise Scale",
    period: "Multi-department operations & 100 users",
    description: "Multi-department procurement and operations on your private servers",
    deployment: "on-premise",
    popular: true,
    badge: "Most Popular",
    features: [
      "Up to 100 users & 3 local tenants / subsidiaries",
      "Everything in Foundation (AMS + PBMS), plus:",
      "PMS (Procurement, Requisitions & POs)",
      "Wildcard private domain binding (*.corp.internal)",
      "Self-service license key generation & .lic download",
    ],
    button: "Request Enterprise Quote",
    buttonVariant: "secondary",
  },
  {
    name: "Sovereign Enterprise",
    tier: "Enterprise",
    price: "Sovereign Contract",
    period: "Full self-hosted ERP & dedicated deployment support",
    description: "Complete self-hosted ERP deployment for institutional and enterprise infrastructure",
    deployment: "on-premise",
    badge: "Enterprise Self-Hosted",
    features: [
      "Unlimited users & unlimited local tenants",
      "Full ERP Suite: AMS + PBMS + PMS (Planning, Budget & Procurement)",
      "Dedicated standalone database architecture",
      "Domain-bound cryptographic license keys",
      "Dedicated implementation & deployment guidance",
    ],
    button: "Contact Enterprise Sales",
    buttonVariant: "default",
  },
];

// Backwards-compatible default export
export const plans: PlanItem[] = saasPlans;
