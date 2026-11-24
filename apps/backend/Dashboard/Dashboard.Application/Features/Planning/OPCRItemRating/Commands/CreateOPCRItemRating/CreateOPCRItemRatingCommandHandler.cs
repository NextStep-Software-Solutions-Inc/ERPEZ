using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemRating.Commands.CreateOPCRItemRating;

public class CreateOPCRItemRatingCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateOPCRItemRatingCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        CreateOPCRItemRatingCommand request, CancellationToken cancellationToken)
    {
        // Validate OPCRItem exists
        _ = await unitOfWork.OPCRItemRepository.GetByIdAsync(request.OPCRItemId, cancellationToken)
            ?? throw new NotFoundException("OPCR Item not found.");

        // Validate against FYActiveKPIMeasurement, the FY-locked snapshot
        var measurement = await unitOfWork.FYActiveKPIMeasurementRepository
            .GetByIdAsync(request.FYActiveKPIMeasurementId, cancellationToken)
            ?? throw new NotFoundException("FY Active KPI Measurement not found.");

        var requestedDimension = request.Dimension.ToString();

        if (!measurement.Dimensions.Contains(requestedDimension, StringComparer.OrdinalIgnoreCase))
            throw new ValidationException(
                $"Dimension '{requestedDimension}' is not configured for measurement '{measurement.Name}'.");

                // Check for duplicate per OPCRItem + FYActiveKPIMeasurement + Dimension
        var duplicate = await unitOfWork.OPCRItemRatingRepository.FindAsync(
            r => r.OPCRItemId == request.OPCRItemId
                            && r.FYActiveKPIMeasurementId == request.FYActiveKPIMeasurementId
                            && r.Dimension == request.Dimension,
            cancellationToken);

        if (duplicate != null)
            throw new ConflictException(
                "A rating for this KPI Measurement already exists for this OPCR Item.");

        var entity = new Domain.Entities.Planning.OPCRItemRating
        {
            Id                = Guid.NewGuid(),
            OPCRItemId        = request.OPCRItemId,
            FYActiveKPIMeasurementId   = request.FYActiveKPIMeasurementId,
            Dimension         = request.Dimension,
            SelfRating        = request.SelfRating,
        };

        await unitOfWork.OPCRItemRatingRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "OPCR Item Rating created successfully.");
    }
}