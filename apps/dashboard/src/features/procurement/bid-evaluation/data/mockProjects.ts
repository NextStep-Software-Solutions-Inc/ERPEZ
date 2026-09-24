import { PublicBiddingProject, SupplierBid } from '../types';

export const RA_12009_BAC_DAYS = 10;
export const BIDDER_SLA_DAYS = 5;

// Helper to calculate the MEARB scores and sort suppliers accordingly
export function getSortedSuppliers(
  suppliers: SupplierBid[],
  criterion: 'LCRB' | 'MEARB',
  techWeight = 70,
  finWeight = 30
): (SupplierBid & { normalizedFinancialScore?: number; totalScore?: number; computedRank: number })[] {
  if (suppliers.length === 0) return [];

  // LCRB logic: sort strictly by lowest financial bid
  if (criterion === 'LCRB') {
    const sorted = [...suppliers].sort((a, b) => a.financialBid - b.financialBid);
    return sorted.map((s, idx) => ({
      ...s,
      computedRank: idx + 1,
    }));
  }

  // MEARB logic:
  // 1. Find the lowest financial bid among all eligible suppliers
  const lowestFinancialBid = Math.min(...suppliers.map((s) => s.financialBid));

  // 2. Normalize and calculate weighted score
  const computedSuppliers = suppliers.map((s) => {
    const finScore = (lowestFinancialBid / s.financialBid) * 100;
    const techScore = s.technicalScore ?? 0;
    
    // Support weight as percentage (70) or decimal (0.7)
    const normalizedTechWeight = techWeight > 1 ? techWeight / 100 : techWeight;
    const normalizedFinWeight = finWeight > 1 ? finWeight / 100 : finWeight;

    // Note: If technicalScore is out of 100 and financial score is out of 100,
    // the formula (technical_score * tech_weight) + (financial_bid_score * fin_weight) is correct.
    // e.g. 95 * 0.70 + 85 * 0.30 = 66.5 + 25.5 = 92.0
    // Let's implement that exact formula:
    const computedTotal = (techScore * normalizedTechWeight) + (finScore * normalizedFinWeight);

    return {
      ...s,
      normalizedFinancialScore: Math.round(finScore * 100) / 100,
      totalScore: Math.round(computedTotal * 100) / 100,
    };
  });

  // 3. Sort by total score descending
  const sorted = computedSuppliers.sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));

  return sorted.map((s, idx) => ({
    ...s,
    computedRank: idx + 1,
  }));
}

const minusDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const initialMockProjects: PublicBiddingProject[] = [
  {
    id: 'proj-1',
    projectName: 'Procurement of Enterprise Server Infrastructure & Core Switch Upgrades',
    abc: 5000000,
    resolutionNumber: 'BAC-RES-2026-0045',
    governingLaw: 'RA_12009',
    awardCriterion: 'LCRB',
    projectStatus: 'Active',
    suppliers: [
      {
        supplierId: 'sup-a',
        supplierName: 'OmniTech Solutions Inc.',
        financialBid: 4200000,
        status: 'Ranked',
        complianceEvents: [
          {
            timestamp: minusDays(2),
            type: 'STATUS_CHANGED',
            detail: 'Eligibility checks completed. Supplier marked as Ranked.',
          },
        ],
      },
      {
        supplierId: 'sup-b',
        supplierName: 'Apex Data Systems Co.',
        financialBid: 4500000,
        status: 'Ranked',
        complianceEvents: [
          {
            timestamp: minusDays(2),
            type: 'STATUS_CHANGED',
            detail: 'Eligibility checks completed. Supplier marked as Ranked.',
          },
        ],
      },
      {
        supplierId: 'sup-c',
        supplierName: 'NexGen Global Technologies',
        financialBid: 4800000,
        status: 'Ranked',
        complianceEvents: [
          {
            timestamp: minusDays(2),
            type: 'STATUS_CHANGED',
            detail: 'Eligibility checks completed. Supplier marked as Ranked.',
          },
        ],
      },
    ],
  },
  {
    id: 'proj-2',
    projectName: 'Procurement of Project Management & ERP Consultancy Services',
    abc: 12000000,
    resolutionNumber: 'BAC-RES-2026-0089',
    governingLaw: 'RA_12009',
    awardCriterion: 'MEARB',
    technicalWeight: 70,
    financialWeight: 30,
    projectStatus: 'Active',
    suppliers: [
      {
        supplierId: 'sup-x',
        supplierName: 'Summit Business Solutions',
        financialBid: 10000000,
        technicalScore: 95,
        status: 'Under_PostQual',
        lcbNoticeSentDate: minusDays(12),
        postQualDocsReceivedDate: minusDays(11), // 11 days ago! (BAC Evaluation Timer SLA is 10 days for RA 12009, so this is overdue!)
        complianceEvents: [
          {
            timestamp: minusDays(12),
            type: 'STATUS_CHANGED',
            detail: 'Eligibility checks completed. Supplier marked as Ranked.',
          },
          {
            timestamp: minusDays(12),
            type: 'NOTICE_SENT',
            detail: 'Notice of LCB sent to bidder. 5-day SLA timer started.',
          },
          {
            timestamp: minusDays(11),
            type: 'DOCS_RECEIVED',
            detail: 'Original post-qualification documents received. Bidder SLA timer stopped. BAC Evaluation timer started.',
          },
        ],
      },
      {
        supplierId: 'sup-y',
        supplierName: 'Value Consulting Group',
        financialBid: 8500000,
        technicalScore: 85,
        status: 'Ranked',
        complianceEvents: [
          {
            timestamp: minusDays(12),
            type: 'STATUS_CHANGED',
            detail: 'Eligibility checks completed. Supplier marked as Ranked.',
          },
        ],
      },
      {
        supplierId: 'sup-z',
        supplierName: 'Integrity Systems & Advisors',
        financialBid: 9000000,
        technicalScore: 88,
        status: 'Ranked',
        complianceEvents: [
          {
            timestamp: minusDays(12),
            type: 'STATUS_CHANGED',
            detail: 'Eligibility checks completed. Supplier marked as Ranked.',
          },
        ],
      },
    ],
  },
  {
    id: 'proj-3',
    projectName: 'Supply and Delivery of Medical Grade Air Conditioning & Air Quality Units',
    abc: 3000000,
    resolutionNumber: 'BAC-RES-2026-0012',
    governingLaw: 'RA_12009',
    awardCriterion: 'LCRB',
    projectStatus: 'Active',
    suppliers: [
      {
        supplierId: 'sup-m1',
        supplierName: 'Bioclimatic Air Filters Inc.',
        financialBid: 2600000,
        status: 'LCB_Notified',
        lcbNoticeSentDate: minusDays(6), // 6 days ago! (Bidder SLA is 5 days, so this is overdue!)
        complianceEvents: [
          {
            timestamp: minusDays(6),
            type: 'STATUS_CHANGED',
            detail: 'Eligibility checks completed. Supplier marked as Ranked.',
          },
          {
            timestamp: minusDays(6),
            type: 'NOTICE_SENT',
            detail: 'Notice of LCB sent to bidder. 5-day SLA timer started.',
          },
        ],
      },
      {
        supplierId: 'sup-m2',
        supplierName: 'AeroClean Ventilation Systems',
        financialBid: 2800000,
        status: 'Ranked',
        complianceEvents: [
          {
            timestamp: minusDays(6),
            type: 'STATUS_CHANGED',
            detail: 'Eligibility checks completed. Supplier marked as Ranked.',
          },
        ],
      },
    ],
  },
];
