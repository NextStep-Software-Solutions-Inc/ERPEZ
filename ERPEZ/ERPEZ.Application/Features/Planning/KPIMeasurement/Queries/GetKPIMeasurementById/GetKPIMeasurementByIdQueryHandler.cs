using ERPEZ.Application.Features.Planning.KPIMeasurement.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Queries.GetKPIMeasurementById;

public class GetKPIMeasurementByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetKPIMeasurementByIdQuery, ApiResponse<KPIMeasurementResponse>>
{
    public async Task<ApiResponse<KPIMeasurementResponse>> Handle(GetKPIMeasurementByIdQuery request, CancellationToken cancellationToken)
    {
        var measurement = await unitOfWork.KPIMeasurementRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("KPI Measurement not found.");

        var response = new KPIMeasurementResponse
        {
            Id = measurement.Id,
            KPIId = measurement.KPIId,
            Dimension = measurement.Dimension,
            MOVs = measurement.MOVs,
            RatingScaleTemplateId = measurement.RatingScaleTemplateId,
            IsMOVEditable = measurement.IsMOVEditable,
            IsScaleEditable = measurement.IsScaleEditable,
        };

        return ApiResponse<KPIMeasurementResponse>.Success(response);
    }
}
