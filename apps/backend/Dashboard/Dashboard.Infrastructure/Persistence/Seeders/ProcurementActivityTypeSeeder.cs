using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Infrastructure.Persistence.Seeders;

/// <summary>
/// Seeds the GPPB-standard procurement activity types with MilestoneKey, DisplayOrder,
/// MinDays/MaxDays interval defaults, and SystemRole discriminators.
/// Idempotent — safe to run on every startup.
/// </summary>
public static class ProcurementActivityTypeSeeder
{
    private static readonly (
        string MilestoneKey,
        string Name,
        string Description,
        int? MinDays,
        int? MaxDays,
        int DisplayOrder,
        ProcurementActivitySystemRole? Role)[] seeds =
    [
        ("ib-posting",              "Advertisement/Posting of IB/REI",             "Posting of Invitation to Bid or Request for Expression of Interest", 0,  null, 0,  ProcurementActivitySystemRole.AdvertisementPosting),
        ("bid-documents-issuance", "Issuance / Availability of Bid Documents",    "Availability and issuance of bidding documents to prospective bidders", 0,  1,    1,  null),
        ("pre-bid-conference",     "Pre-Bid Conference",                         "Pre-bid conference with prospective bidders",                        7,  12,   2,  ProcurementActivitySystemRole.PreBidConference),
        ("clarification-deadline", "Deadline for Submission of Clarifications", "Deadline for prospective bidders to request clarification",          3,  5,    3,  null),
        ("bid-submission-opening", "Deadline for Submission and Opening of Bids","Deadline for bid submission and simultaneous bid opening",           12, 30,   4,  ProcurementActivitySystemRole.SubmissionOpeningOfBids),
        ("bid-evaluation",         "Bid Evaluation",                             "Evaluation of submitted bids by the BAC",                            7,  15,   5,  ProcurementActivitySystemRole.BidEvaluation),
        ("post-qualification",     "Post-Qualification",                         "Verification and validation of the lowest calculated bidder",       7,  30,   6,  ProcurementActivitySystemRole.PostQualification),
        ("bac-resolution-award",   "BAC Resolution of Award",                    "Preparation and signing of BAC resolution recommending award",       7,  7,    7,  null),
        ("approval-resolution",    "Approval of BAC Resolution",                 "Approval of BAC resolution by the Head of the Procuring Entity",     5,  7,    8,  null),
        ("notice-of-award",        "Issuance of Notice of Award (NOA)",          "Issuance of Notice of Award to the winning bidder",                  3,  3,    9,  ProcurementActivitySystemRole.NoticeOfAward),
        ("contract-signing",       "Contract Signing",                           "Signing of the contract between the agency and the winning bidder", 10, 10,   10, ProcurementActivitySystemRole.ContractSigning),
        ("notice-to-proceed",      "Issuance of Notice to Proceed (NTP)",        "Issuance of Notice to Proceed to the contractor/supplier",          7,  7,    11, ProcurementActivitySystemRole.NoticeToProceed),
    ];

    public static async Task SeedAsync(IUnitOfWork unitOfWork)
    {
        foreach (var (key, name, desc, min, max, order, role) in seeds)
        {
            ProcurementActivityType? existing = null;

            if (role.HasValue)
            {
                existing = await unitOfWork.ProcurementActivityTypeRepository
                    .FindAsync(a => a.SystemRole == role.Value);
            }

            if (existing == null)
            {
                existing = await unitOfWork.ProcurementActivityTypeRepository
                    .FindAsync(a => a.MilestoneKey == key || a.Name == name);
            }

            if (existing != null)
            {
                var modified = false;
                if (existing.MilestoneKey != key)
                {
                    existing.MilestoneKey = key;
                    modified = true;
                }
                if (existing.DisplayOrder != order)
                {
                    existing.DisplayOrder = order;
                    modified = true;
                }
                if (!existing.MinDays.HasValue && min.HasValue)
                {
                    existing.MinDays = min;
                    modified = true;
                }
                if (!existing.MaxDays.HasValue && max.HasValue)
                {
                    existing.MaxDays = max;
                    modified = true;
                }
                if (!existing.SystemRole.HasValue && role.HasValue)
                {
                    existing.SystemRole = role;
                    modified = true;
                }

                if (modified)
                {
                    unitOfWork.ProcurementActivityTypeRepository.Update(existing);
                }
                continue;
            }

            var entity = new ProcurementActivityType
            {
                Name         = name,
                Description  = desc,
                MinDays      = min,
                MaxDays      = max,
                DisplayOrder = order,
                MilestoneKey = key,
                SystemRole   = role,
                IsActive     = true,
                IsArchived   = false
            };

            await unitOfWork.ProcurementActivityTypeRepository.AddAsync(entity);
        }

        await unitOfWork.SaveChangesAsync();
    }
}