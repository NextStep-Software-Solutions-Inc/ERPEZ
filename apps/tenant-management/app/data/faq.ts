export const faqs = [
  {
    question: "What is ERP?",
    answer:
      "Enterprise Resource Planning (ERP) is a software system that integrates an organization's core operations—such as multi-tenant account governance, strategic budget planning, and procurement workflows—into a unified platform to streamline processes and improve operational efficiency.",
  },
  {
    question: "Why is ERP important for organizations?",
    answer:
      "ERP helps organizations automate workflows, reduce manual errors, improve decision-making with real-time data, and enhance collaboration across departments.",
  },
  {
    question: "What are the key features of an ERP system?",
    answer:
      "Core features include centralized identity and role-based access control (AMS), strategic budget planning and commitment controls (PBMS), and transparent procurement workflows from purchase requests and bidding to contract awards (PMS).",
  },
  {
    question: "How does ERP benefit employees and management?",
    answer:
      "For employees, ERP reduces repetitive tasks and improves access to information. For management, it provides accurate insights, better planning, and more control over resources.",
  },
  {
    question: "What is the difference between ERPez Cloud SaaS and On-Premise deployments?",
    answer:
      "ERPez Cloud SaaS is fully managed in our secure ERPez Datacenter with automated multi-tenancy, elasticity, and immediate updates. On-Premise is an air-gapped deployment bundle designed for customer-owned servers with an isolated standalone database, zero cloud tethering, and strict local governance.",
  },
  {
    question: "How does offline licensing work in an air-gapped On-Premise environment?",
    answer:
      "Each On-Premise subscription issues a unique cryptographic license key structured as [PREFIX]-[PLAN]-[EXPIRY]-[TOKEN]-[CHECKSUM]. It is cryptographically bound to the administrator's authorized email address and allowed domain, enabling authentic validation without requiring an external internet connection.",
  },
  {
    question: "Can we manage tenants locally on an On-Premise installation?",
    answer:
      "Yes. On-Premise deployments allow administrators to register and manage local tenants/subsidiaries directly within the self-hosted environment, governed by the maximum tenant quota and domain constraints defined in their license key.",
  },
  {
    question: "How do domain constraints and tenant status controls protect our system?",
    answer:
      "Super administrators can instantly enable or disable tenants to suspend unauthorized access. Furthermore, if a request domain does not match the license's AllowedDomain constraint, the system immediately disables authentication to prevent spoofing or unauthorized deployment clones.",
  },
];
