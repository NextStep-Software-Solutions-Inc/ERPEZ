using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.UpdateOPCRRatingStatus;

public class UpdateOPCRRatingStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateOPCRRatingStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOPCRRatingStatusCommand request, CancellationToken cancellationToken)
    {
        // Get OPCR entity (not OPCRActivityRating)
        var opcr = await unitOfWork.OPCRRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR not found.");

        var currentStatus = opcr.RatingStatus;
        var newStatus = request.UpdateStatus.Status;

        // Validate status transition
        ValidateStatusTransition(currentStatus, newStatus);

        // Process status change based on target status
        switch (newStatus)
        {
            case OPCRRatingStatus.Submitted:
                HandleSubmit(opcr);
                break;

            case OPCRRatingStatus.Returned:
                HandleReturn(opcr);
                break;

            case OPCRRatingStatus.Draft:
                HandleDraft(opcr);
                break;

            default:
                throw new ValidationException($"Unsupported status: {newStatus}");
        }

        unitOfWork.OPCRRepository.Update(opcr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"OPCR rating status updated to {newStatus} successfully.");
    }

    private static void HandleSubmit(Domain.Entities.Planning.OPCR opcr)
    {
        opcr.RatingStatus = OPCRRatingStatus.Submitted;
        opcr.RatingSubmittedDate = DateTime.UtcNow;
        opcr.RatingReturnedDate = null;
    }

    private static void HandleReturn(Domain.Entities.Planning.OPCR opcr)
    {
        opcr.RatingStatus = OPCRRatingStatus.Returned;
        opcr.RatingReturnedDate = DateTime.UtcNow;
    }

    private static void HandleDraft(Domain.Entities.Planning.OPCR opcr)
    {
        opcr.RatingStatus = OPCRRatingStatus.Draft;
        opcr.RatingSubmittedDate = null;
        opcr.RatingReturnedDate = null;
    }

    private static void ValidateStatusTransition(OPCRRatingStatus currentStatus, OPCRRatingStatus newStatus)
    {
        // Define valid status transitions
        var validTransitions = new Dictionary<OPCRRatingStatus, OPCRRatingStatus[]>
        {
            { OPCRRatingStatus.Draft, [OPCRRatingStatus.Submitted] },
            { OPCRRatingStatus.Submitted, [OPCRRatingStatus.Returned] },
            { OPCRRatingStatus.Returned, [OPCRRatingStatus.Draft, OPCRRatingStatus.Submitted] }
        };

        if (!validTransitions.TryGetValue(currentStatus, out OPCRRatingStatus[]? value))
        {
            throw new ValidationException($"Invalid current status: {currentStatus}");
        }

        if (!value.Contains(newStatus))
        {
            throw new ValidationException($"Cannot transition from {currentStatus} to {newStatus}. Valid transitions from {currentStatus} are: {string.Join(", ", value)}");
        }
    }
}
