using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using System.Linq;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Commands.UpdateKPIMeasurement;

public class UpdateKPIMeasurementCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateKPIMeasurementCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateKPIMeasurementCommand request, CancellationToken cancellationToken)
    {
        var measurement = await unitOfWork.KPIMeasurementRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Measurement not found.");

        var updateData = request.UpdateKPIMeasurement;

        // Validate RatingScaleTemplate if provided
        if (updateData.RatingScaleTemplateId.HasValue)
        {
            var template = await unitOfWork.RatingScaleTemplateRepository.GetByIdAsync(updateData.RatingScaleTemplateId.Value, cancellationToken: cancellationToken);
            if (template == null)
                throw new NotFoundException("Rating Scale Template not found.");
        }

        if (updateData.MOVs != null)
            measurement.MOVs = updateData.MOVs;

        if (updateData.Dimensions != null)
            measurement.Dimensions = updateData.Dimensions
                .Select(dimension => dimension.ToString())
                .ToList();

        if (updateData.RatingScaleTemplateId.HasValue)
            measurement.RatingScaleTemplateId = updateData.RatingScaleTemplateId;

        if (updateData.IsMOVEditable.HasValue)
            measurement.IsMOVEditable = updateData.IsMOVEditable.Value;

        if (updateData.IsScaleEditable.HasValue)
            measurement.IsScaleEditable = updateData.IsScaleEditable.Value;

        unitOfWork.KPIMeasurementRepository.Update(measurement);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "KPI Measurement updated successfully.");
    }
}
