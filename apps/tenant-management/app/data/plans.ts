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
    price: "$99",
    period: "per month",
    description: "Core accounting, stock, and asset tracking for small teams",
    deployment: "saas",
    monthlyAmountCents: 9900,
    annualAmountCents: 98000,
    features: [
      "Up to 15 users & 1 tenant",
      "AMS (Account Management System)",
      "SAMS (Supply & Asset Management System)",
      "ERPez Cloud multi-tenant datacenter",
      "Email support & automatic updates",
    ],
    button: "Start Free Trial",
    buttonVariant: "default",
    annualPrice: "$980",
    annualPriceSave: "$208",
  },
  {
    name: "Professional",
    tier: "Professional",
    price: "$299",
    period: "per month",
    description: "Full procurement and supply chain suite for growing businesses",
    deployment: "saas",
    monthlyAmountCents: 29900,
    annualAmountCents: 299000,
    features: [
      "Up to 50 users & 1 tenant",
      "Everything in Starter, plus:",
      "PMS (Procurement Management System)",
      "Requisitions, purchase orders & delivery tracking",
      "Priority 24/7 support & 99.5% uptime SLA",
    ],
    button: "Upgrade to Professional",
    buttonVariant: "secondary",
    popular: true,
    annualPrice: "$2,990",
    annualPriceSave: "$598",
  },
  {
    name: "SaaS Enterprise",
    tier: "Enterprise",
    price: "$599",
    period: "per month",
    description: "Full ERP suite with budget planning and dedicated cloud isolation",
    deployment: "saas",
    monthlyAmountCents: 59900,
    annualAmountCents: 599000,
    features: [
      "Unlimited users & multiple subsidiaries",
      "Everything in Professional, plus:",
      "PBMS (Planning & Budget Management System)",
      "Dedicated Isolated Operational Database",
      "Custom integrations, webhooks & 99.95% SLA",
    ],
    button: "Upgrade to Enterprise",
    buttonVariant: "default",
    annualPrice: "$5,990",
    annualPriceSave: "$1,198",
  },
];

export const onPremisePlans: PlanItem[] = [
  {
    name: "On-Premise Foundation",
    tier: "Starter",
    price: "$1,499",
    period: "per year",
    description: "Self-hosted sovereign deployment for private local server infrastructure",
    deployment: "on-premise",
    badge: "Air-Gapped Ready",
    annualAmountCents: 149900,
    features: [
      "Up to 25 users & 1 local tenant database",
      "AMS (Account Management) + SAMS (Assets & Supplies)",
      "100% Offline HMAC-SHA256 signature verification",
      "Localhost / internal IP domain lock",
      "Instant self-service key generation & .lic download",
    ],
    button: "Buy On-Premise License",
    buttonVariant: "default",
    annualPrice: "$1,499",
  },
  {
    name: "On-Premise Professional",
    tier: "Professional",
    price: "$4,999",
    period: "per year",
    description: "Multi-department procurement and operations on your private servers",
    deployment: "on-premise",
    popular: true,
    badge: "Most Popular",
    annualAmountCents: 499900,
    features: [
      "Up to 100 users & 3 local tenants / subsidiaries",
      "Everything in Foundation, plus:",
      "PMS (Procurement, Requisitions & POs)",
      "Wildcard private domain binding (*.corp.internal)",
      "Instant self-service key generation & .lic download",
    ],
    button: "Buy On-Premise License",
    buttonVariant: "secondary",
    annualPrice: "$4,999",
  },
  {
    name: "Sovereign Enterprise",
    tier: "Enterprise",
    price: "Custom",
    period: "per year",
    description: "Complete sovereign ERP deployment for defense, finance, and enterprise",
    deployment: "on-premise",
    badge: "Maximum Sovereignty",
    features: [
      "Unlimited users & unlimited local tenants",
      "Full ERP Suite: AMS + SAMS + PMS + PBMS (Budget Planning)",
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
