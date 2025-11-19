using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WFPOutcome.Queries.GetWFPOutcomes;

public class GetWFPOutcomesQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.WFPOutcome>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
