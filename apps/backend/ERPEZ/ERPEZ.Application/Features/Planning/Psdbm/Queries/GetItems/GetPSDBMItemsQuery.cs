using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetItems;

public record GetPsdbmItemsQuery : IRequest<ApiResponse<GetPsdbmItemsResponse>> 
{
    public required string Mode { get; init; }
    public string? Search { get; init; }
    public string? Category { get; init; }
    public int Max { get; init; } = 50;
    public string? Depot { get; init; }
}