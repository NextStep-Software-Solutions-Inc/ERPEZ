using ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Queries.GetFYActiveKPIMeasurementById;

public class GetFYActiveKPIMeasurementByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetFYActiveKPIMeasurementByIdQuery, ApiResponse<FYActiveKPIMeasurementResponse>>
{
    public async Task<ApiResponse<FYActiveKPIMeasurementResponse>> Handle(GetFYActiveKPIMeasurementByIdQuery request, CancellationToken cancellationToken)
    {
        var measurement = await unitOfWork.FYActiveKPIMeasurementRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("FY Active KPI Measurement not found.");

        var response = new FYActiveKPIMeasurementResponse
        {
            Id = measurement.Id,
            FYActiveKPIId = measurement.FYActiveKPIId,
            Name = measurement.Name,
            Statement = measurement.Statement,
            Dimensions = measurement.Dimensions,
            MOVs = measurement.MOVs,
            RatingScaleTemplateId = measurement.RatingScaleTemplateId,
            IsMOVEditable = measurement.IsMOVEditable,
            IsScaleEditable = measurement.IsScaleEditable,
            CreatedAt = measurement.CreatedAt,
            CreatedBy = measurement.CreatedBy
        };

        return ApiResponse<FYActiveKPIMeasurementResponse>.Success(response);
    }
}
