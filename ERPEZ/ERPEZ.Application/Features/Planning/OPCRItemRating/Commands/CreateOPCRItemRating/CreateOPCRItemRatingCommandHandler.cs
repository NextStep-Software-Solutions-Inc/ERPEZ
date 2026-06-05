using ERPEZ.Domain.Enums;
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

        // Validate KPIMeasurement exists
        _ = await unitOfWork.KPIMeasurementRepository.GetByIdAsync(request.KPIMeasurementId, cancellationToken)
            ?? throw new NotFoundException("KPI Measurement not found.");

        // Check for duplicate per OPCRItem + KPIMeasurement + Dimension
        var duplicate = await unitOfWork.OPCRItemRatingRepository.FindAsync(
            r => r.OPCRItemId == request.OPCRItemId
              && r.KPIMeasurementId == request.KPIMeasurementId,
            cancellationToken);

        if (duplicate != null)
            throw new ConflictException(
                "A rating for this KPI Measurement already exists for this OPCR Item.");

        var entity = new Domain.Entities.Planning.OPCRItemRating
        {
            Id                = Guid.NewGuid(),
            OPCRItemId        = request.OPCRItemId,
            KPIMeasurementId  = request.KPIMeasurementId,
            SelfRating        = request.SelfRating,
        };

        await unitOfWork.OPCRItemRatingRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "OPCR Item Rating created successfully.");
    }
}