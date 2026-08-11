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

        // Batch validation: Check for duplicates via repository abstraction
        var duplicateIds = await unitOfWork.APPPPMPRepository.GetLinkedPPMPIdsAsync(request.APPId, ppmpIds, cancellationToken);

        if (duplicateIds.Any())
        {
            var duplicateDetails = existingPpmps
                .Where(p => duplicateIds.Contains(p.Id))
                .Select(p => p.PPMPNumber)
                .ToList();
            throw new ConflictException($"The following PPMPs are already linked to this APP: {string.Join(", ", duplicateDetails)}");
        }

        // Create APPPPMP links for all validated PPMPs
        var linksToAdd = existingPpmps
            .Select(ppmp => new APPPPMP
            {
                Id = Guid.NewGuid(),
                APPId = request.APPId,
                PPMPId = ppmp.Id
            })
            .ToList();

        // Add all links at once
        if (linksToAdd.Any())
        {
            await unitOfWork.APPPPMPRepository.AddRangeAsync(linksToAdd, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return ApiResponse<Unit>.Success(Unit.Value, $"{linksToAdd.Count} PPMPs linked successfully.");
    }
}
