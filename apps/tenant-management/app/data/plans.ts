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
    period: "Customized for up to 15 users, AMS & PBMS",
    description: "Core account, user, planning, and budget management for small teams",
    deployment: "saas",
    features: [
      "Up to 15 users & 1 tenant",
      "AMS (Account Management System)",
      "PBMS (Planning and Budget Management System)",
      "Role-based access control & tenant management",
      "ERPez Cloud multi-tenant datacenter",
      "Email support & automatic updates",
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
      "Priority 24/7 support & 99.5% uptime SLA",
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
    description: "Full ERP suite with dedicated database isolation and high availability",
    deployment: "saas",
    features: [
      "Unlimited users & multiple subsidiaries",
      "Full ERP Suite: AMS + PBMS + PMS",
      "Dedicated Isolated Operational Database",
      "Custom integrations, webhooks & 99.95% SLA",
      "Dedicated account manager & bespoke onboarding",
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
    period: "Air-gapped deployment for up to 25 users (AMS + PBMS)",
    description: "Self-hosted sovereign deployment for private local server infrastructure",
    deployment: "on-premise",
    badge: "Air-Gapped Ready",
    features: [
      "Up to 25 users & 1 local tenant database",
      "AMS (Account Management System)",
      "PBMS (Planning and Budget Management System)",
      "100% Offline HMAC-SHA256 signature verification",
      "Localhost / internal IP domain lock",
      "Instant self-service key generation & .lic download",
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
      "Instant self-service key generation & .lic download",
    ],
    button: "Request Enterprise Quote",
    buttonVariant: "secondary",
  },
  {
    name: "Sovereign Enterprise",
    tier: "Enterprise",
    price: "Sovereign Contract",
    period: "Full sovereign ERP & dedicated on-site SLA",
    description: "Complete sovereign ERP deployment for defense, finance, and enterprise",
    deployment: "on-premise",
    badge: "Maximum Sovereignty",
    features: [
      "Unlimited users & unlimited local tenants",
      "Full ERP Suite: AMS + PBMS + PMS (Planning, Budget & Procurement)",
      "High-availability standalone database clustering",
      "Hardware-bound machine ID encryption",
      "Dedicated on-site deployment engineer & SLA",
    ],
    button: "Contact Enterprise Sales",
    buttonVariant: "default",
  },
];

// Backwards-compatible default export
export const plans: PlanItem[] = saasPlans;
