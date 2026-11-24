using ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Queries.GetProcurementPolicyConfigs;

public record GetProcurementPolicyConfigsQuery : IRequest<PaginatedApiResponse<ProcurementPolicyConfigResponse>>
{
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
    public int? Page { get; init; }
    public int? PageSize { get; init; }
}
