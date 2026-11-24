using ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Queries.GetKPIPerformanceMeasureById;

public class GetKPIPerformanceMeasureByIdQuery : IRequest<ApiResponse<KPIPerformanceMeasureDetailedResponse>>
{
    public Guid Id { get; set; }

    public GetKPIPerformanceMeasureByIdQuery(Guid id)
    {
        Id = id;
    }
}
