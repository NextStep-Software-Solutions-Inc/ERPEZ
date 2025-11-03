using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCR.Queries.GetOPCRs;

public class GetOPCRsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.OPCR>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
