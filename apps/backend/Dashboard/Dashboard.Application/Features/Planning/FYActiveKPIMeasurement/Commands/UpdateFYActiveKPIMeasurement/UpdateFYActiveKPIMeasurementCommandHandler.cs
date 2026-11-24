using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using System.Linq;

namespace ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Commands.UpdateFYActiveKPIMeasurement;

public class UpdateFYActiveKPIMeasurementCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateFYActiveKPIMeasurementCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateFYActiveKPIMeasurementCommand request, CancellationToken cancellationToken)
    {
        var measurement = await unitOfWork.FYActiveKPIMeasurementRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("FY Active KPI Measurement not found.");

        var updateData = request.UpdateFYActiveKPIMeasurement;

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

        unitOfWork.FYActiveKPIMeasurementRepository.Update(measurement);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "FY Active KPI Measurement updated successfully.");
    }
}
