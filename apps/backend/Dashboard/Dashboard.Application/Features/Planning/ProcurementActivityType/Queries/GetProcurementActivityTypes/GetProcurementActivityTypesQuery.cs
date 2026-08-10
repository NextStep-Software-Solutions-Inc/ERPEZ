using ERPEZ.Application.Features.Planning.ProcurementActivityType.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementActivityType.Queries.GetProcurementActivityTypes;

public record GetProcurementActivityTypesQuery : IRequest<PaginatedApiResponse<ProcurementActivityTypeResponse>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
}
