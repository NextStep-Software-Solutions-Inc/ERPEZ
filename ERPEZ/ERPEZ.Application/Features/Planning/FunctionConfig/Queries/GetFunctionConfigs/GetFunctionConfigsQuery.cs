using ERPEZ.Application.Features.Planning.FunctionConfig.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionConfig.Queries.GetFunctionConfigs;

public record GetFunctionConfigsQuery : IRequest<PaginatedApiResponse<FunctionConfigResponse>>
{
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
    public int? Page { get; init; }
    public int? PageSize { get; init; }
}
