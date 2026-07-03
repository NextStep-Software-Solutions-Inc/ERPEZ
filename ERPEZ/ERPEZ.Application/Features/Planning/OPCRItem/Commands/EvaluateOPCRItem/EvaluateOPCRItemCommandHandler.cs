// EvaluateOPCRItemCommandHandler.cs
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using System.Linq;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Commands.EvaluateOPCRItem;

public class EvaluateOPCRItemCommandHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService)
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

        // ── 3. Upsert self-ratings per measurement ────────────────────────
        foreach (var ratingRequest in request.Request.DimensionRate)
        {
            var measurement = await unitOfWork.FYActiveKPIMeasurementRepository
                .GetByIdAsync(ratingRequest.FYActiveKPIMeasurementId, cancellationToken)
                ?? throw new NotFoundException(
                    $"FY Active KPI Measurement '{ratingRequest.FYActiveKPIMeasurementId}' not found.");

            var requestedDimension = ratingRequest.Dimension.ToString();

            if (!measurement.Dimensions.Contains(requestedDimension, StringComparer.OrdinalIgnoreCase))
                throw new ValidationException(
                    $"Dimension '{requestedDimension}' is not configured for measurement '{measurement.Name}'.");

            var existing = await unitOfWork.OPCRItemRatingRepository.FindAsync(
                r => r.OPCRItemId              == request.OPCRItemId
                                    && r.FYActiveKPIMeasurementId == ratingRequest.FYActiveKPIMeasurementId
                                    && r.Dimension == ratingRequest.Dimension,
                cancellationToken);

            if (existing != null)
            {
                existing.SelfRating = ratingRequest.SelfRating;
                unitOfWork.OPCRItemRatingRepository.Update(existing);
            }
            else
            {
                var newRating = new Domain.Entities.Planning.OPCRItemRating
                {
                    Id                       = Guid.NewGuid(),
                    OPCRItemId               = request.OPCRItemId,
                    FYActiveKPIMeasurementId = ratingRequest.FYActiveKPIMeasurementId,
                    Dimension                = ratingRequest.Dimension,
                    SelfRating               = ratingRequest.SelfRating,
                    CreatedAt                = DateTime.UtcNow
                };
                await unitOfWork.OPCRItemRatingRepository.AddAsync(newRating, cancellationToken);
            }
        }

        // ── 4. Upsert MOV attachments by requirement name ─────────────────
        foreach (var movRequest in request.Request.Mov)
        {
            _ = await unitOfWork.FYActiveKPIMeasurementRepository
                .GetByIdAsync(movRequest.FYActiveKPIMeasurementId, cancellationToken)
                ?? throw new NotFoundException(
                    $"FY Active KPI Measurement '{movRequest.FYActiveKPIMeasurementId}' not found.");

            var existingMov = await unitOfWork.OPCRItemMOVRepository.FindAsync(
                mov => mov.OPCRItemId == request.OPCRItemId
                    && mov.FYActiveKPIMeasurementId == movRequest.FYActiveKPIMeasurementId
                    && mov.RequirementName == movRequest.Mov,
                cancellationToken);

            // Skip promotion entirely if this MOV already has this exact file attached
            if (existingMov != null && existingMov.FileId == movRequest.FileId)
                continue;

            string permanentUrl;
            try
            {
                permanentUrl = await fileStorageService.PromoteFileAsync(movRequest.FileId);
            }
            catch (FileNotFoundException)
            {
                throw new ValidationException(
                    $"The uploaded file for '{movRequest.Mov}' could not be found. It may have expired — please re-upload and try again.");
            }

            if (existingMov != null)
            {
                if (existingMov.FileId.HasValue)
                    await fileStorageService.DeletePermanentAsync(existingMov.FileId.Value);

                existingMov.FileId = movRequest.FileId;
                existingMov.AttachedUrl = permanentUrl;
                existingMov.UploadedDate = DateTime.UtcNow;
                unitOfWork.OPCRItemMOVRepository.Update(existingMov);
                continue;
            }

            var newMov = new Domain.Entities.Planning.OPCRItemMOV
            {
                Id = Guid.NewGuid(),
                OPCRItemId = request.OPCRItemId,
                FYActiveKPIMeasurementId = movRequest.FYActiveKPIMeasurementId,
                RequirementName = movRequest.Mov,
                FileId = movRequest.FileId,
                AttachedUrl = permanentUrl,
                UploadedDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            await unitOfWork.OPCRItemMOVRepository.AddAsync(newMov, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Item evaluation saved successfully.");
    }
}