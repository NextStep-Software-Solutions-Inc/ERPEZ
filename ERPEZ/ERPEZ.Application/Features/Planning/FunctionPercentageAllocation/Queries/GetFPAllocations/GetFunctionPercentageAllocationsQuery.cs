using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Queries.GetFPAllocations;

public class GetFunctionPercentageAllocationsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
