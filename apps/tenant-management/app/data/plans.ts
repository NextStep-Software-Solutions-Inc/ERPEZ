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
  deployment?: "saas" | "on-premise";
  badge?: string;
}

export const saasPlans: PlanItem[] = [
  {
    name: "Starter",
    price: "$99",
    period: "per month",
    description: "Perfect for small businesses getting started with ERPez SaaS",
    deployment: "saas",
    features: [
      "Up to 10 users",
      "ERPez Cloud Datacenter hosted",
      "Basic financial management",
      "Inventory tracking",
      "Email support & automatic updates",
    ],
    button: "Start Free Trial",
    buttonVariant: "default",
    annualPrice: "$980",
    annualPriceSave: "$189",
  },
  {
    name: "Professional",
    price: "$299",
    period: "per month",
    description: "Ideal for growing multi-department businesses",
    deployment: "saas",
    features: [
      "Up to 50 users",
      "Multi-tenant cloud architecture",
      "Advanced financial reporting",
      "Supply chain & project management",
      "Priority 24/7 support & SLAs",
    ],
    button: "Start Free Trial",
    buttonVariant: "secondary",
    popular: true,
    annualPrice: "$2999",
    annualPriceSave: "$589",
  },
  {
    name: "SaaS Enterprise",
    price: "Custom",
    period: "per month",
    description: "High-capacity cloud infrastructure for global organizations",
    deployment: "saas",
    features: [
      "Unlimited users & multiple subsidiaries",
      "Full ERP suite + AI analytics",
      "Dedicated cloud tenant isolation",
      "Custom integrations & webhooks",
      "Dedicated Technical Account Manager",
    ],
    button: "Contact Sales",
    buttonVariant: "default",
  },
];

export const onPremisePlans: PlanItem[] = [
  {
    name: "On-Premise Foundation",
    price: "$1,499",
    period: "per year",
    description: "Self-hosted deployment bundle for private server infrastructure",
    deployment: "on-premise",
    badge: "Air-Gapped Ready",
    features: [
      "Local server deployment bundle (isolated DB)",
      "Up to 3 local tenants / subsidiaries",
      "1 Subscription = 1 Cryptographic Key",
      "Offline signature verification (zero cloud tethering)",
      "Strict domain lock security controls",
    ],
    button: "Request Deployment",
    buttonVariant: "default",
  },
  {
    name: "Sovereign Enterprise",
    price: "Custom",
    period: "per year",
    description: "Complete sovereign deployment for defense, finance, and enterprise",
    deployment: "on-premise",
    popular: true,
    badge: "Maximum Sovereignty",
    features: [
      "Unlimited local tenants on your hardware",
      "Air-gapped offline operation with custom prefix",
      "System Management (Keycloak) user decoupling",
      "High-availability standalone database cluster",
      "Custom domain constraints & tenant disable controls",
      "Dedicated on-site & secure channel SLA",
    ],
    button: "Contact Enterprise",
    buttonVariant: "secondary",
  },
];

// Backwards-compatible default export
export const plans: PlanItem[] = saasPlans;

