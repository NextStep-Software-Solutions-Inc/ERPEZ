// EvaluateOPCRItemCommandHandler.cs
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Commands.EvaluateOPCRItem;

public class EvaluateOPCRItemCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<EvaluateOPCRItemCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        EvaluateOPCRItemCommand request, CancellationToken cancellationToken)
    {
        // ── 1. Load OPCRItem ─────────────────────────────────────────────
        var item = await unitOfWork.OPCRItemRepository
            .GetByIdAsync(request.OPCRItemId, cancellationToken)
            ?? throw new NotFoundException("OPCR Item not found.");

        // ── 2. Update actual accomplishment + justification ───────────────
        if (request.Request.ActualAccomplishment != null)
            item.ActualAccomplishment = request.Request.ActualAccomplishment;

        if (request.Request.Justification != null)
            item.Justification = request.Request.Justification;

        unitOfWork.OPCRItemRepository.Update(item);

        // ── 3. Upsert self-ratings per dimension ──────────────────────────
        foreach (var ratingRequest in request.Request.Ratings)
        {
            // Validate the measurement belongs to this item's KPI
            var measurement = await unitOfWork.FYActiveKPIMeasurementRepository
                .GetByIdAsync(ratingRequest.FYActiveKPIMeasurementId, cancellationToken)
                ?? throw new NotFoundException(
                    $"FY Active KPI Measurement '{ratingRequest.FYActiveKPIMeasurementId}' not found.");

            // Check if a rating already exists for this item + measurement
            var existing = await unitOfWork.OPCRItemRatingRepository.FindAsync(
                r => r.OPCRItemId              == request.OPCRItemId
                  && r.FYActiveKPIMeasurementId == ratingRequest.FYActiveKPIMeasurementId,
                cancellationToken);

            if (existing != null)
            {
                // ── Update existing self-rating ───────────────────────────
                existing.SelfRating = ratingRequest.SelfRating;
                unitOfWork.OPCRItemRatingRepository.Update(existing);
            }
            else
            {
                // ── Create new rating ─────────────────────────────────────
                var newRating = new Domain.Entities.Planning.OPCRItemRating
                {
                    Id                       = Guid.NewGuid(),
                    OPCRItemId               = request.OPCRItemId,
                    FYActiveKPIMeasurementId = ratingRequest.FYActiveKPIMeasurementId,
                    SelfRating               = ratingRequest.SelfRating,
                    CreatedAt                = DateTime.UtcNow
                };
                await unitOfWork.OPCRItemRatingRepository.AddAsync(newRating, cancellationToken);
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Item evaluation saved successfully.");
    }
}