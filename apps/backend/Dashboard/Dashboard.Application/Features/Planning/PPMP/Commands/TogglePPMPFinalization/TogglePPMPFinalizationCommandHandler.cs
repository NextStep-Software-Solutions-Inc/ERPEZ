using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.TogglePPMPFinalization;

public class TogglePPMPFinalizationCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<TogglePPMPFinalizationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(TogglePPMPFinalizationCommand request, CancellationToken cancellationToken)
    {
        var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"PPMP '{request.Id}' not found.");

        if (ppmp.IsDeleted)
            throw new NotFoundException($"PPMP '{request.Id}' not found.");

        if (request.IsFinal)
        {
            if (ppmp.Status != StatusEnum.Approved)
            {
                throw new ValidationException($"Only approved PPMPs can be marked as final. Current status: '{ppmp.Status}'.");
            }

            ppmp.IsFinal = true;
        }
        else
        {
            // Enforce business invariant: Once a Final PPMP has been consumed by an approved Final APP,
            // it must not be possible to revert it to non-final.
            var activeLinks = await unitOfWork.APPPPMPRepository.GetActiveLinksByPPMPIdsAsync([ppmp.Id], cancellationToken);
            var conflictingFinalApp = activeLinks.FirstOrDefault(l =>
                l.APP != null &&
                !l.APP.IsDeleted &&
                string.Equals(l.APP.APPType, "Final", StringComparison.OrdinalIgnoreCase) &&
                (l.APP.Status == StatusEnum.Approved || string.Equals(l.APP.IsFinal, "true", StringComparison.OrdinalIgnoreCase)));

            if (conflictingFinalApp != null)
            {
                throw new ValidationException(
                    $"Cannot unmark PPMP '{ppmp.PPMPNumber}' as final because it has already been consumed by approved Final APP '{conflictingFinalApp.APP?.APPNumber}'.");
            }

            ppmp.IsFinal = false;
        }

        unitOfWork.PPMPRepository.Update(ppmp);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var actionText = request.IsFinal ? "marked as final" : "unmarked as final";
        return ApiResponse<Unit>.Success(Unit.Value, $"PPMP '{ppmp.PPMPNumber}' {actionText} successfully.");
    }
}
