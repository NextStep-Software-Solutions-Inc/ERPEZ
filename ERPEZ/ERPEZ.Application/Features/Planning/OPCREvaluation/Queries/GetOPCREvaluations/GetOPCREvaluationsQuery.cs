using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCREvaluation.Queries.GetOPCREvaluations;

public class GetOPCREvaluationsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.OPCREvaluation>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}
