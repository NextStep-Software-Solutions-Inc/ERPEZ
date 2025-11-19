using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Queries.GetDUFundAllocations;

public class GetDUFundAllocationsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.DUFundAllocation>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
