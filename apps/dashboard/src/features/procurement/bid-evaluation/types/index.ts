export type BidStatus = 'Ranked' | 'LCB_Notified' | 'Under_PostQual' | 'LCRB' | 'Disqualified';

export type GoverningLaw = 'RA_9184' | 'RA_12009';

export type AwardCriterion = 'LCRB' | 'MEARB';

export interface ComplianceEvent {
  timestamp: string;
  type: 'BIDDER_SLA_EXPIRED' | 'BAC_SLA_EXPIRED' | 'STATUS_CHANGED' | 'NOTICE_SENT' | 'DOCS_RECEIVED';
  detail: string;
}

export interface SupplierBid {
  supplierId: string;
  supplierName: string;
  financialBid: number;
  technicalScore?: number; // Only used/required for MEARB
  status: BidStatus;
  lcbNoticeSentDate?: string; // ISO String when LCB notice was sent
  postQualDocsReceivedDate?: string; // ISO String when post-qual docs were received
  passedPostQual?: boolean;
  complianceEvents: ComplianceEvent[];
}

export interface BacResolutionDraft {
  resolutionNumber: string;
  projectName: string;
  abc: number;
  winningSupplier: string;
  lcrbAmount: number;
  draftedAt: string;
}

export interface PublicBiddingProject {
  id: string;
  projectName: string;
  abc: number;
  resolutionNumber: string;
  governingLaw: GoverningLaw;
  awardCriterion: AwardCriterion;
  technicalWeight?: number; // e.g. 70
  financialWeight?: number; // e.g. 30
  suppliers: SupplierBid[];
  projectStatus: 'Active' | 'Pending_HoPE_Approval' | 'Approved';
  bacResolutionDraft?: BacResolutionDraft;
}
