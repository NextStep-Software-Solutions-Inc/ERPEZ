using ERPEZ.Domain.Entities.Planning;
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
        var app = await unitOfWork.APPRepository.GetByIdAsync(request.APPId, cancellationToken)
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

        // Fetch all existing links (both active and soft-deleted) for this APP and requested PPMPs
        var existingLinks = await unitOfWork.APPPPMPRepository.GetLinksByAppAndPpmpIdsAsync(request.APPId, ppmpIds, cancellationToken);

        // Enforce uniqueness for active links
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
