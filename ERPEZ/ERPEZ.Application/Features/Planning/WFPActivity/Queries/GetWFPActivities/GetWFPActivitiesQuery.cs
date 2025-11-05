using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPActivity.Queries.GetWFPActivities;

public class GetWFPActivitiesQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.WFPActivity>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
