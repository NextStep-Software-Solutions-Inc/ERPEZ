using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFP.Queries.GetWFPs;

public class GetWFPsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.WFP>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
