export interface QuoteInquiry {
  referenceCode: string;
  contactName: string;
  email: string;
  phone?: string;
  organizationName?: string;
  teamSize?: string;
  planName: string;
  tier?: string;
  deploymentType?: string;
  requestedModules: string[];
  scopeSummary?: string;
  estimatedDelivery?: string;
  status: string;
  submittedAtUtc: string;
}

export interface DemoInquiry {
  referenceCode: string;
  contactName: string;
  email: string;
  phone?: string;
  organizationName?: string;
  preferredDate: string;
  preferredTimeSlot: string;
  notes?: string;
  status: string;
  submittedAtUtc: string;
}

export interface SubscriberInquiry {
  email: string;
  source: string;
  status: string;
  subscribedAtUtc: string;
}

export interface InquiriesSummary {
  quotes: QuoteInquiry[];
  demos: DemoInquiry[];
  subscribers: SubscriberInquiry[];
}
