using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Commands.UpdateOPCRRatingStatus;

public class UpdateOPCRRatingStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateOPCRRatingStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        UpdateOPCRRatingStatusCommand request, CancellationToken cancellationToken)
    {
        var opcr = await unitOfWork.OPCRRepository.GetByIdAsync(
            request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR not found.");

        var currentStatus = opcr.ReviewStatus;   // ✅ was RatingStatus
        var newStatus = request.UpdateStatus.Status.ToString();

        ValidateStatusTransition(currentStatus, newStatus);

        switch (request.UpdateStatus.Status)
        {
            case OPCRRatingStatus.Submitted:
                opcr.ReviewStatus  = nameof(OPCRRatingStatus.Submitted);  // ✅
                opcr.SubmittedDate = DateTime.UtcNow;                      // ✅ was RatingSubmittedDate
                break;

            case OPCRRatingStatus.Returned:
                opcr.ReviewStatus = nameof(OPCRRatingStatus.Returned);    // ✅
                // ✅ RatingReturnedDate removed — store in Remarks or omit
                break;

            case OPCRRatingStatus.Draft:
                opcr.ReviewStatus  = nameof(OPCRRatingStatus.Draft);      // ✅
                opcr.SubmittedDate = null;                                  // ✅
                opcr.ApprovedDate  = null;
                break;

            default:
                throw new ValidationException($"Unsupported status: {request.UpdateStatus.Status}");
        }

        unitOfWork.OPCRRepository.Update(opcr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(
            Unit.Value,
            $"OPCR review status updated to {newStatus} successfully.");
    }

    private static void ValidateStatusTransition(string currentStatus, string newStatus)
    {
        var validTransitions = new Dictionary<string, string[]>
        {
            { nameof(OPCRRatingStatus.Draft),      [nameof(OPCRRatingStatus.Submitted)] },
            { nameof(OPCRRatingStatus.Submitted),  [nameof(OPCRRatingStatus.Returned)] },
            { nameof(OPCRRatingStatus.Returned),   [nameof(OPCRRatingStatus.Draft), nameof(OPCRRatingStatus.Submitted)] }
        };

        if (!validTransitions.TryGetValue(currentStatus, out var validNext))
            throw new ValidationException($"Invalid current status: {currentStatus}");

        if (!validNext.Contains(newStatus))
            throw new ValidationException(
                $"Cannot transition from {currentStatus} to {newStatus}. " +
                $"Valid transitions: {string.Join(", ", validNext)}");
    }
}