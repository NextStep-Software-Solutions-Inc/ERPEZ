using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using AppItemEntity = ERPEZ.Domain.Entities.Planning.APPItem;

namespace ERPEZ.Application.Features.Planning.APP.Commands.CloneFinalAPP;

/// <summary>
/// Handles the creation of a Final APP by carrying forward all procurement data
/// from an approved Indicative APP.
///
/// Lifecycle:  Indicative APP (Approved) → [this handler] → Final APP (Draft)
///
/// The handler:
///   1. Validates the source APP is Indicative and Approved.
///   2. Creates a new independent Final APP entity with SourceAPPId pointing back.
///   3. Deep-clones every APPPPMP junction (PPMP references) so the Final APP
///      inherits the same consolidated PPMP sources.
///   4. Deep-clones every APPItem with all procurement detail fields so the
///      Final APP starts with the same items, modes, fund sources, schedules, etc.
///   5. Does NOT modify the source Indicative APP in any way.
/// </summary>
public class CloneFinalAPPCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CloneFinalAPPCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CloneFinalAPPCommand request, CancellationToken cancellationToken)
    {
        // 1. Load source APP with all related data (items, PPMP links)
        var sourceApp = await unitOfWork.APPRepository.GetAPPWithDetailsAsync(request.SourceAppId, cancellationToken)
            ?? throw new NotFoundException("Source Indicative APP not found.");

        // 2. Validate: source must be Indicative type
        if (!string.Equals(sourceApp.APPType, "Indicative", StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException(
                "A Final APP can only be created from an Indicative APP. " +
                "To create an Updated APP, use the Clone Updated APP workflow from an approved Final or Updated APP.");
        }

        // 3. Validate: source must be Approved
        if (sourceApp.Status != StatusEnum.Approved)
        {
            throw new ValidationException(
                "A Final APP can only be created from an Approved Indicative APP. " +
                $"The source APP is currently '{sourceApp.Status}'.");
        }

        // 3.1 Validate: A Final APP must not already exist for this Indicative APP
        var existingFinalQuery = unitOfWork.APPRepository
            .Query(a => a.SourceAPPId == sourceApp.Id && a.APPType == "Final" && !a.IsDeleted)
            .OrderByDescending(a => a.CreatedAt);

        var existingFinal = await unitOfWork.APPRepository.GetFirstAsync(existingFinalQuery, cancellationToken);
        if (existingFinal != null)
        {
            throw new ConflictException(
                $"A Final APP already exists for this Indicative APP ({existingFinal.APPNumber}). " +
                "View the existing Final APP or create an Updated APP from the latest valid version.");
        }

        // 4. Build the Final APP number / name
        var appNumber = string.IsNullOrWhiteSpace(request.APPNumber)
            ? $"{sourceApp.APPNumber}-FINAL"
            : request.APPNumber;

        // Guard against duplicate APP numbers
        var hasAppNumber = await unitOfWork.APPRepository.HasAPPNumberAsync(appNumber, cancellationToken);
        if (hasAppNumber)
            throw new ConflictException($"APP with number '{appNumber}' already exists.");

        var appName = string.IsNullOrWhiteSpace(request.Name)
            ? $"Final APP FY {sourceApp.FiscalYear?.Year.ToString() ?? ""}"
            : request.Name;

        var now = DateTime.UtcNow;

        // 5. Create the Final APP entity — starts as Draft, fully editable
        var finalApp = new ERPEZ.Domain.Entities.Planning.APP
        {
            Id           = Guid.NewGuid(),
            APPNumber    = appNumber,
            Name         = appName,
            FiscalYearId = sourceApp.FiscalYearId,
            APPType      = "Final",
            Batch        = string.IsNullOrWhiteSpace(request.Batch)   ? sourceApp.Batch   : request.Batch,
            Quarter      = string.IsNullOrWhiteSpace(request.Quarter) ? sourceApp.Quarter : request.Quarter,
            VersionNumber  = 1,
            VersionDate    = now,
            SourceAPPId    = sourceApp.Id,    // traceability link to Indicative APP
            IsFinal        = "false",          // becomes "true" only when Approved (ChangeAPPStatus handler)
            Remarks        = request.Remarks    ?? sourceApp.Remarks,
            Description    = request.Description ?? sourceApp.Description,
            Status         = StatusEnum.Draft,
        };

        await unitOfWork.APPRepository.AddAsync(finalApp, cancellationToken);

        // 6. Deep-clone APPPPMP junction records (PPMP source references)
        //    This gives the Final APP access to the same consolidated PPMP sources
        //    without creating a live reference — the Indicative APP's PPMP links are
        //    unchanged.
        foreach (var link in sourceApp.APPPPMPs.Where(l => !l.IsDeleted))
        {
            var newLink = new APPPPMP
            {
                Id    = Guid.NewGuid(),
                APPId = finalApp.Id,
                PPMPId = link.PPMPId
            };
            await unitOfWork.APPPPMPRepository.AddAsync(newLink, cancellationToken);
        }

        // 7. Deep-clone APPItem records with full procurement detail
        //    Each item is a new independent record:
        //      - IsNew    = false  (carried-forward, not a new addition)
        //      - IsRevised = false (not yet revised in this version)
        //    This mirrors the exact carry-forward logic used by CloneUpdatedAPP,
        //    which enables the same Final→Updated revision-tracking pattern later.
        foreach (var item in sourceApp.APPItems.Where(i => !i.IsDeleted))
        {
            var newItem = new AppItemEntity
            {
                Id                       = Guid.NewGuid(),
                APPId                    = finalApp.Id,
                PPMPItemId               = item.PPMPItemId,
                ProcurementModeId        = item.ProcurementModeId,
                FundSourceId             = item.FundSourceId,
                OfficeId                 = item.OfficeId,
                PAPCode                  = item.PAPCode,
                Remarks                  = item.Remarks,
                IsEarlyProcurementActivity = item.IsEarlyProcurementActivity,
                IsOutsourced             = item.IsOutsourced,
                BidEvaluationCriteria    = item.BidEvaluationCriteria,
                ProcurementStrategies    = item.ProcurementStrategies != null
                    ? new List<ProcurementStrategy>(item.ProcurementStrategies)
                    : null,
                StartOfProcurementOverride = item.StartOfProcurementOverride,
                EndOfProcurementOverride   = item.EndOfProcurementOverride,
                EstimatedBudgetOverride    = item.EstimatedBudgetOverride,
                EPARemarks                 = item.EPARemarks,
                IsNew     = false,
                IsRevised = false,
            };
            await unitOfWork.APPItemRepository.AddAsync(newItem, cancellationToken);
        }

        // 8. Deep-clone APPSignatory records so Final APP inherits independent signatories
        foreach (var sig in sourceApp.APPSignatories.Where(s => !s.IsDeleted))
        {
            var newSig = new APPSignatory
            {
                Id = Guid.NewGuid(),
                APPId = finalApp.Id,
                UserId = sig.UserId,
                PersonnelPositionId = sig.PersonnelPositionId,
                RoleKey = sig.RoleKey,
                Name = sig.Name,
                Position = sig.Position,
                Department = sig.Department,
                SignatureDate = sig.SignatureDate,
                SequenceOrder = sig.SequenceOrder
            };
            await unitOfWork.APPSignatoryRepository.AddAsync(newSig, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(
            finalApp.Id,
            $"Final APP '{appName}' created successfully from Indicative APP '{sourceApp.APPNumber}'. " +
            $"{sourceApp.APPItems.Count(i => !i.IsDeleted)} item(s) and " +
            $"{sourceApp.APPPPMPs.Count(l => !l.IsDeleted)} PPMP source(s) carried forward.");
    }
}
