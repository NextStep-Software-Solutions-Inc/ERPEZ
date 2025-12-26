using ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Queries.GetKPIPerformanceMeasureById;

public class GetKPIPerformanceMeasureByIdHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetKPIPerformanceMeasureByIdQuery, ApiResponse<KPIPerformanceMeasureDetailedResponse>>
{
    public async Task<ApiResponse<KPIPerformanceMeasureDetailedResponse>> Handle(GetKPIPerformanceMeasureByIdQuery request, CancellationToken cancellationToken)
    {
        var kpiPerformanceMeasure = await unitOfWork.KPIPerformanceMeasureRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

        if (kpiPerformanceMeasure == null)
            throw new NotFoundException("KPI Performance Measure not found.");

        var response = new KPIPerformanceMeasureDetailedResponse
        {
            Id = kpiPerformanceMeasure.Id,
            KPIId = kpiPerformanceMeasure.KPIId,
            PerformanceMeasureId = kpiPerformanceMeasure.PerformanceMeasureId,
            CreatedAt = kpiPerformanceMeasure.CreatedAt,
            UpdatedAt = kpiPerformanceMeasure.UpdatedAt,
            CreatedByUser = kpiPerformanceMeasure.CreatedBy,
            UpdatedByUser = kpiPerformanceMeasure.UpdatedBy
        };

        return ApiResponse<KPIPerformanceMeasureDetailedResponse>.Success(response);
    }
}
