using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOKPI.Queries.GetMFOKPIsQuery;

public class GetMFOKPIsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.MFOKPI>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
