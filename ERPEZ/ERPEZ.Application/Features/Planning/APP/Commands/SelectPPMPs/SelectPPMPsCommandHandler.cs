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
        _ = await unitOfWork.APPRepository.GetByIdAsync(request.APPId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        // Track APPPPMP links to create after validation
        var linksToAdd = new List<APPPPMP>();

        // Validate each PPMP and check for duplicates
        foreach (var ppmpId in request.PPMPIds)
        {
            // Validate PPMP exists
            var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(ppmpId, cancellationToken)
                ?? throw new NotFoundException($"PPMP with ID '{ppmpId}' not found.");

            // Check if already linked to this APP
            var existsInApp = await unitOfWork.APPPPMPRepository.ExistsInAPPAsync(
                request.APPId, ppmpId, cancellationToken);

            if (existsInApp)
                throw new ConflictException($"PPMP '{ppmp.PPMPNumber}' is already linked to this APP.");

            // Create selection record
            var selection = new APPPPMP
            {
                Id = Guid.NewGuid(),
                APPId = request.APPId,
                PPMPId = ppmpId
            };

            linksToAdd.Add(selection);
        }

        // Add all APPPPMP links at once
        if (linksToAdd.Count > 0)
        {
            await unitOfWork.APPPPMPRepository.AddRangeAsync(linksToAdd, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return ApiResponse<Unit>.Success(Unit.Value, $"{linksToAdd.Count} PPMPs linked successfully.");
    }
}
