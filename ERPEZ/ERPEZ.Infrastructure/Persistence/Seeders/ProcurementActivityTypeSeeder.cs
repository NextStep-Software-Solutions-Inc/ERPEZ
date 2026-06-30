using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Infrastructure.Persistence.Seeders;

/// <summary>
/// Seeds the GPPB-standard procurement activity types with SystemRole discriminators.
/// Idempotent — safe to run on every startup. Skips any role already present.
/// </summary>
public static class ProcurementActivityTypeSeeder
{
    private static readonly (
        string Name,
        string Description,
        int?   MinDays,
        int?   MaxDays,
        ProcurementActivitySystemRole Role)[] seeds =
    [
        ("Advertisement/Posting of IB/REI", "Posting of Invitation to Bid or Request for Expression of Interest", 7, null, ProcurementActivitySystemRole.AdvertisementPosting),
        ("Pre-Bid Conference",              "Pre-bid conference with prospective bidders",                         null, null, ProcurementActivitySystemRole.PreBidConference),
        ("Submission/Opening of Bids",      "Deadline for bid submission and simultaneous bid opening",            null, null, ProcurementActivitySystemRole.SubmissionOpeningOfBids),
        ("Bid Evaluation",                  "Evaluation of submitted bids by the BAC",                             1, 7, ProcurementActivitySystemRole.BidEvaluation),
        ("Post-Qualification",              "Verification and validation of the lowest calculated bidder",        5, 30, ProcurementActivitySystemRole.PostQualification),
        ("Notice of Award",                 "Issuance of Notice of Award to the winning bidder",                   null, null, ProcurementActivitySystemRole.NoticeOfAward),
        ("Contract Signing",                "Signing of the contract between the agency and the winning bidder",  null, null, ProcurementActivitySystemRole.ContractSigning),
        ("Notice to Proceed",               "Issuance of Notice to Proceed to the contractor/supplier",           null, null, ProcurementActivitySystemRole.NoticeToProceed),
    ];

    public static async Task SeedAsync(IUnitOfWork unitOfWork)
    {
        foreach (var (name, desc, min, max, role) in seeds)
        {
            var exists = await unitOfWork.ProcurementActivityTypeRepository
                .ExistsWithSystemRoleAsync(role);

            if (exists)
                continue;

            var entity = new ProcurementActivityType
            {
                Name        = name,
                Description = desc,
                MinDays     = min,
                MaxDays     = max,
                SystemRole  = role,
                IsActive    = true,
                IsArchived  = false
            };

            await unitOfWork.ProcurementActivityTypeRepository.AddAsync(entity);
        }

        await unitOfWork.SaveChangesAsync();
    }
}