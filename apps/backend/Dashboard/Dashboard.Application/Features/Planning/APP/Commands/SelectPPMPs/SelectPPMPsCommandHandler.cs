using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Commands.SelectPPMPs;

public class SelectPPMPsCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<SelectPPMPsCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(SelectPPMPsCommand request, CancellationToken cancellationToken)
    {
        // Validate APP exists
        var app = await unitOfWork.APPRepository.GetAPPWithDetailsAsync(request.APPId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        // Batch validation: Load all requested PPMPs in one query via repository abstraction
        var ppmpIds = request.PPMPIds;
        var existingPpmps = await unitOfWork.PPMPRepository.FindAllAsync(
            p => ppmpIds.Contains(p.Id) && !p.IsDeleted, cancellationToken);

        // Check for missing PPMPs
        var foundIds = existingPpmps.Select(p => p.Id).ToHashSet();
        var missingIds = ppmpIds.Except(foundIds).ToList();
        if (missingIds.Any())
            throw new NotFoundException($"PPMPs not found: {string.Join(", ", missingIds)}");

        // Enforce Fiscal Year matching: PPMP.FiscalYearId == APP.FiscalYearId
        var invalidFyPpmps = existingPpmps.Where(p => p.FiscalYearId != app.FiscalYearId).ToList();
        if (invalidFyPpmps.Any())
        {
            var invalidNumbers = string.Join(", ", invalidFyPpmps.Select(p => p.PPMPNumber));
            throw new ValidationException($"PPMP does not belong to the APP Fiscal Year. Invalid PPMPs: {invalidNumbers}");
        }

        // Enforce Status == Approved: Only approved PPMPs can be consolidated into an APP
        var unapprovedPpmps = existingPpmps.Where(p => p.Status != StatusEnum.Approved).ToList();
        if (unapprovedPpmps.Any())
        {
            var unapprovedDetails = string.Join(", ", unapprovedPpmps.Select(p => $"'{p.PPMPNumber}' (Status: {p.Status})"));
            throw new ValidationException($"Only approved PPMPs can be consolidated into an APP. Unapproved PPMPs: {unapprovedDetails}");
        }

        // Enforce APPType ↔ PPMPType pairing:
        // Indicative and Final APPs establish the initial procurement baseline and cannot accept Supplemental PPMPs.
        // Supplemental PPMPs must only be consolidated into an Updated APP.
        var isUpdatedApp = string.Equals(app.APPType, "Updated", StringComparison.OrdinalIgnoreCase);
        if (!isUpdatedApp)
        {
            var supplementalPpmps = existingPpmps.Where(p => p.PPMPType == PPMPTypeEnum.Supplemental).ToList();
            if (supplementalPpmps.Any())
            {
                var invalidNumbers = string.Join(", ", supplementalPpmps.Select(p => $"'{p.PPMPNumber}'"));
                throw new ValidationException(
                    $"Supplemental PPMPs cannot be consolidated into a '{app.APPType}' APP. They must be consolidated into an Updated APP. Invalid PPMPs: {invalidNumbers}");
            }
        }

        // Determine root ancestor of target APP to identify its lineage family
        var targetRootAppId = app.SourceAPP?.SourceAPPId ?? app.SourceAPPId ?? app.Id;

        // Fetch all active links for the requested PPMPs across any non-deleted APP
        var allActiveLinks = await unitOfWork.APPPPMPRepository.GetActiveLinksByPPMPIdsAsync(ppmpIds, cancellationToken);

        // Guard against consolidating PPMPs that are already attached to an UNRELATED APP lineage
        var conflictingLinks = allActiveLinks
            .Where(l => {
                var otherApp = l.APP;
                if (otherApp == null || otherApp.Id == app.Id) return false;
                var otherRootAppId = otherApp.SourceAPP?.SourceAPPId ?? otherApp.SourceAPPId ?? otherApp.Id;
                return otherRootAppId != targetRootAppId;
            })
            .ToList();

        if (conflictingLinks.Any())
        {
            var conflictDetails = conflictingLinks
                .Select(l => {
                    var ppmpNumber = existingPpmps.FirstOrDefault(p => p.Id == l.PPMPId)?.PPMPNumber ?? l.PPMPId.ToString();
                    var appNumber = l.APP?.APPNumber ?? l.APPId.ToString();
                    return $"PPMP '{ppmpNumber}' is already consolidated in APP '{appNumber}'";
                })
                .Distinct()
                .ToList();

            throw new ConflictException($"Cannot consolidate: {string.Join("; ", conflictDetails)}.");
        }

        // Fetch all existing links (both active and soft-deleted) for THIS APP and requested PPMPs
        var existingLinks = await unitOfWork.APPPPMPRepository.GetLinksByAppAndPpmpIdsAsync(request.APPId, ppmpIds, cancellationToken);

        // Enforce uniqueness for active links in this APP
        var activeDuplicatePpmpIds = existingLinks.Where(l => !l.IsDeleted).Select(l => l.PPMPId).ToHashSet();
        if (activeDuplicatePpmpIds.Any())
        {
            var duplicateDetails = existingPpmps
                .Where(p => activeDuplicatePpmpIds.Contains(p.Id))
                .Select(p => p.PPMPNumber)
                .ToList();
            throw new ConflictException($"The following PPMPs are already linked to this APP: {string.Join(", ", duplicateDetails)}");
        }

        // Restore soft-deleted APPPPMP links if present
        var softDeletedLinks = existingLinks.Where(l => l.IsDeleted).ToList();
        foreach (var link in softDeletedLinks)
        {
            link.IsDeleted = false;
            link.DeletedAt = null;
            link.DeletedBy = null;
        }

        // Also restore soft-deleted APPItems corresponding to the restored PPMPs
        var restoredPpmpIds = softDeletedLinks.Select(l => l.PPMPId).ToHashSet();
        if (restoredPpmpIds.Any())
        {
            var softDeletedAppItems = await unitOfWork.APPItemRepository.GetAPPItemsByPPMPIdsAsync(request.APPId, restoredPpmpIds, cancellationToken);
            foreach (var item in softDeletedAppItems.Where(i => i.IsDeleted))
            {
                item.IsDeleted = false;
                item.DeletedAt = null;
                item.DeletedBy = null;
            }
        }

        // Identify PPMPs that do not have any existing link (neither active nor soft-deleted)
        var existingLinkPpmpIds = existingLinks.Select(l => l.PPMPId).ToHashSet();
        var linksToAdd = existingPpmps
            .Where(ppmp => !existingLinkPpmpIds.Contains(ppmp.Id))
            .Select(ppmp => new APPPPMP
            {
                Id = Guid.NewGuid(),
                APPId = request.APPId,
                PPMPId = ppmp.Id
            })
            .ToList();

        if (linksToAdd.Any())
        {
            await unitOfWork.APPPPMPRepository.AddRangeAsync(linksToAdd, cancellationToken);
        }

        var totalProcessed = linksToAdd.Count + softDeletedLinks.Count;
        if (totalProcessed > 0)
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return ApiResponse<Unit>.Success(Unit.Value, $"{totalProcessed} PPMP(s) linked successfully.");
    }
}
