import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PublicBiddingProject, SupplierBid, BidStatus, ComplianceEvent, BacResolutionDraft } from '../types';
import { initialMockProjects, getSortedSuppliers } from '../data/mockProjects';

interface BidEvaluationState {
  projects: PublicBiddingProject[];
  selectedProjectId: string | null;
}

interface BidEvaluationActions {
  selectProject: (projectId: string) => void;
  sendNoticeOfLcb: (projectId: string, supplierId: string) => void;
  logDocsReceived: (projectId: string, supplierId: string) => void;
  setPostQualResult: (projectId: string, supplierId: string, passed: boolean) => void;
  recommendForAward: (projectId: string) => void;
  disqualifyAwardedSupplierForNoa: (input: {
    projectId?: string | null;
    supplierId?: string | null;
    supplierName?: string | null;
    resolutionNumber?: string | null;
    note?: string | null;
  }) => void;
  logComplianceEvent: (projectId: string, supplierId: string, type: ComplianceEvent['type'], detail: string) => void;
  approveProject: (projectId: string) => void;
  resetProject: (projectId: string) => void;
}

type StoreType = BidEvaluationState & BidEvaluationActions;

const PERSIST_KEY = 'erpez-bid-evaluation-store';

export const useBidEvaluationStore = create<StoreType>()(
  persist(
    (set) => ({
      projects: initialMockProjects,
      selectedProjectId: 'proj-1', // Default to first project

      selectProject: (projectId) => {
        set({ selectedProjectId: projectId });
      },

      sendNoticeOfLcb: (projectId, supplierId) => {
        const timestamp = new Date().toISOString();
        set((state) => ({
          projects: state.projects.map((proj) => {
            if (proj.id !== projectId) return proj;

            return {
              ...proj,
              suppliers: proj.suppliers.map((sup) => {
                if (sup.supplierId !== supplierId) return sup;

                const newEvent: ComplianceEvent = {
                  timestamp,
                  type: 'NOTICE_SENT',
                  detail: 'Notice of LCB sent to bidder. 5-day Bidder SLA timer started.',
                };

                return {
                  ...sup,
                  status: 'LCB_Notified',
                  lcbNoticeSentDate: timestamp,
                  postQualDocsReceivedDate: undefined,
                  complianceEvents: [...sup.complianceEvents, newEvent],
                };
              }),
            };
          }),
        }));
      },

      logDocsReceived: (projectId, supplierId) => {
        const timestamp = new Date().toISOString();
        set((state) => ({
          projects: state.projects.map((proj) => {
            if (proj.id !== projectId) return proj;

            return {
              ...proj,
              suppliers: proj.suppliers.map((sup) => {
                if (sup.supplierId !== supplierId) return sup;

                const newEvent: ComplianceEvent = {
                  timestamp,
                  type: 'DOCS_RECEIVED',
                  detail: 'Original post-qualification documents received. Bidder SLA timer stopped. BAC Evaluation SLA timer started.',
                };

                return {
                  ...sup,
                  status: 'Under_PostQual',
                  postQualDocsReceivedDate: timestamp,
                  complianceEvents: [...sup.complianceEvents, newEvent],
                };
              }),
            };
          }),
        }));
      },

      setPostQualResult: (projectId, supplierId, passed) => {
        const timestamp = new Date().toISOString();
        set((state) => ({
          projects: state.projects.map((proj) => {
            if (proj.id !== projectId) return proj;

            // We determine if we are failing or passing
            const updatedSuppliers = proj.suppliers.map((sup) => {
              if (sup.supplierId !== supplierId) return sup;

              const status: BidStatus = passed ? 'LCRB' : 'Disqualified';
              const newEvent: ComplianceEvent = {
                timestamp,
                type: 'STATUS_CHANGED',
                detail: `Post-qualification evaluation completed. Result: ${passed ? 'PASSED (Status set to LCRB)' : 'FAILED (Supplier Disqualified)'}.`,
              };

              return {
                ...sup,
                status,
                passedPostQual: passed,
                complianceEvents: [...sup.complianceEvents, newEvent],
              };
            });

            return {
              ...proj,
              suppliers: updatedSuppliers,
            };
          }),
        }));
      },

      recommendForAward: (projectId) => {
        const timestamp = new Date().toISOString();
        set((state) => ({
          projects: state.projects.map((proj) => {
            if (proj.id !== projectId) return proj;

            // Find the winning supplier (who has status LCRB)
            const sorted = getSortedSuppliers(
              proj.suppliers,
              proj.awardCriterion,
              proj.technicalWeight,
              proj.financialWeight
            );
            const winner = sorted.find((s) => s.status === 'LCRB');

            if (!winner) return proj;

            const bacResolutionDraft: BacResolutionDraft = {
              resolutionNumber: proj.resolutionNumber,
              projectName: proj.projectName,
              abc: proj.abc,
              winningSupplier: winner.supplierName,
              lcrbAmount: winner.financialBid,
              draftedAt: timestamp,
            };

            const updatedSuppliers = proj.suppliers.map((sup) => {
              if (sup.supplierId !== winner.supplierId) return sup;

              const newEvent: ComplianceEvent = {
                timestamp,
                type: 'STATUS_CHANGED',
                detail: `Recommended for Award. Drafted BAC Resolution ${proj.resolutionNumber} for HoPE approval.`,
              };

              return {
                ...sup,
                complianceEvents: [...sup.complianceEvents, newEvent],
              };
            });

            return {
              ...proj,
              projectStatus: 'Pending_HoPE_Approval',
              bacResolutionDraft,
              suppliers: updatedSuppliers,
            };
          }),
        }));
      },

      disqualifyAwardedSupplierForNoa: (input) => {
        const timestamp = new Date().toISOString();
        set((state) => ({
          projects: state.projects.map((proj) => {
            const matchesProject =
              (input.projectId && proj.id === input.projectId) ||
              (input.resolutionNumber &&
                (proj.resolutionNumber === input.resolutionNumber ||
                  proj.bacResolutionDraft?.resolutionNumber === input.resolutionNumber));

            if (!matchesProject) return proj;

            const awardedSupplier = proj.suppliers.find(
              (supplier) =>
                (input.supplierId && supplier.supplierId === input.supplierId) ||
                (input.supplierName && supplier.supplierName === input.supplierName) ||
                supplier.supplierName === proj.bacResolutionDraft?.winningSupplier,
            );

            if (!awardedSupplier) return proj;

            const updatedSuppliers = proj.suppliers.map((supplier) => {
              if (supplier.supplierId !== awardedSupplier.supplierId) {
                return supplier;
              }

              const newEvent: ComplianceEvent = {
                timestamp,
                type: 'STATUS_CHANGED',
                detail:
                  input.note?.trim() ||
                  'Award forfeited from NOA contract execution failure. Supplier disqualified and next-ranked bidder cascade unlocked.',
              };

              return {
                ...supplier,
                status: 'Disqualified' as BidStatus,
                passedPostQual: false,
                complianceEvents: [...supplier.complianceEvents, newEvent],
              };
            });

            return {
              ...proj,
              projectStatus: 'Active' as const,
              bacResolutionDraft: undefined,
              suppliers: updatedSuppliers,
            };
          }),
        }));
      },

      logComplianceEvent: (projectId, supplierId, type, detail) => {
        const timestamp = new Date().toISOString();
        set((state) => ({
          projects: state.projects.map((proj) => {
            if (proj.id !== projectId) return proj;

            return {
              ...proj,
              suppliers: proj.suppliers.map((sup) => {
                if (sup.supplierId !== supplierId) return sup;

                // Check if this exact type of event was logged recently for the current state to prevent duplicates
                const alreadyLogged = sup.complianceEvents.some(
                  (ev) => ev.type === type && ev.detail === detail
                );

                if (alreadyLogged) return sup;

                const newEvent: ComplianceEvent = {
                  timestamp,
                  type,
                  detail,
                };

                return {
                  ...sup,
                  complianceEvents: [...sup.complianceEvents, newEvent],
                };
              }),
            };
          }),
        }));
      },

      approveProject: (projectId) => {
        set((state) => ({
          projects: state.projects.map((proj) => {
            if (proj.id !== projectId) return proj;
            return {
              ...proj,
              projectStatus: 'Approved',
            };
          }),
        }));
      },

      resetProject: (projectId) => {
        // Reset the target project to its default initial seeded state
        const initial = initialMockProjects.find((p) => p.id === projectId);
        if (!initial) return;

        set((state) => ({
          projects: state.projects.map((proj) => {
            if (proj.id !== projectId) return proj;
            return JSON.parse(JSON.stringify(initial)); // deep copy clone
          }),
        }));
      },
    }),
    {
      name: PERSIST_KEY,
    }
  )
);
