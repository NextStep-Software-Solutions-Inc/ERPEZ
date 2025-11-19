using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Queries.GetMFOPAPs;

public class GetMFOPAPsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.MFOPAP>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
