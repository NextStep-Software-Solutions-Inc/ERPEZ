using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Commands.CreateKPIMeasurement;

public class CreateKPIMeasurementCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateKPIMeasurementCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateKPIMeasurementCommand request, CancellationToken cancellationToken)
    {
        // Validate KPI exists
        var kpi = await unitOfWork.KPIRepository.GetByIdAsync(request.KPIId, cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"KPI with ID {request.KPIId} not found.");

        // Validate Dimension enum
        if (!Enum.TryParse<DimensionEnum>(request.Dimension, true, out var dimensionEnum))
            throw new ValidationException($"Invalid Dimension: {request.Dimension}");

        // Validate uniqueness: A KPI can have only one measurement per unique Dimension
        var existingMeasurement = await unitOfWork.KPIMeasurementRepository.FindAsync(
            m => m.KPIId == request.KPIId && m.Dimension == request.Dimension,
            cancellationToken);

        if (existingMeasurement != null)
            throw new ConflictException($"A measurement with Dimension '{request.Dimension}' already exists for this KPI.");

        // Validate RatingScaleTemplate if provided
        if (request.RatingScaleTemplateId.HasValue)
        {
            _ = await unitOfWork.RatingScaleTemplateRepository.GetByIdAsync(
                request.RatingScaleTemplateId.Value, cancellationToken: cancellationToken)
                ?? throw new NotFoundException($"RatingScaleTemplate with ID {request.RatingScaleTemplateId.Value} not found.");
        }

        var measurement = new Domain.Entities.Planning.KPIMeasurement
        {
            Id = Guid.NewGuid(),
            KPIId = request.KPIId,
            Dimension = request.Dimension,
            RatingScaleTemplateId = request.RatingScaleTemplateId,
            MOVs = request.MOVs,
            IsMOVEditable = request.IsMOVEditable,
            IsScaleEditable = request.IsScaleEditable,
        };

        await unitOfWork.KPIMeasurementRepository.AddAsync(measurement, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(measurement.Id, "KPI Measurement created successfully.");
    }
}
