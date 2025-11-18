using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRKPI.Queries.GetOPCRKPIs;

public class GetOPCRKPIsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.OPCRKPI>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
