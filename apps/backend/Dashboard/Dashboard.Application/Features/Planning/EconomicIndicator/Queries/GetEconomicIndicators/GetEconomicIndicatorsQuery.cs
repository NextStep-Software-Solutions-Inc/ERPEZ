using ERPEZ.Application.Features.Planning.EconomicIndicator.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.EconomicIndicator.Queries.GetEconomicIndicators;

public record GetEconomicIndicatorsQuery : IRequest<PaginatedApiResponse<EconomicIndicatorResponse>>
{
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
    public int? Page { get; init; }
    public int? PageSize { get; init; }
}
