using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.APP.Commands.SelectPPMPs;

public class SelectPPMPsCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<SelectPPMPsCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(SelectPPMPsCommand request, CancellationToken cancellationToken)
    {
        // Validate APP exists
        _ = await unitOfWork.APPRepository.GetByIdAsync(request.APPId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        // Batch validation: Load all requested PPMPs in one query
        var ppmpIds = request.PPMPIds;
        var existingPpmps = await unitOfWork.PPMPRepository.Query()
            .Where(p => ppmpIds.Contains(p.Id) && !p.IsDeleted)
            .ToListAsync(cancellationToken);

        // Check for missing PPMPs
        var foundIds = existingPpmps.Select(p => p.Id).ToHashSet();
        var missingIds = ppmpIds.Except(foundIds).ToList();
        if (missingIds.Any())
            throw new NotFoundException($"PPMPs not found: {string.Join(", ", missingIds)}");

        // Batch validation: Check for duplicates in one query
        var duplicateIds = await unitOfWork.APPPPMPRepository.Query()
            .Where(ap => ap.APPId == request.APPId && ppmpIds.Contains(ap.PPMPId) && !ap.IsDeleted)
            .Select(ap => ap.PPMPId)
            .ToListAsync(cancellationToken);

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
