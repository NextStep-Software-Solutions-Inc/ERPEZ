using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetItems;

public record GetPsdbmItemsQuery : IRequest<ApiResponse<GetPsdbmItemsResponse>> 
{
    public required string Mode { get; init; }
    public string? Search { get; init; }
    public string? Category { get; init; }
    public string? Depot { get; init; }
    public string? Availability { get; init; }
    public string? StockFilter { get; init; }
    public string? SortBy { get; init; }
    public bool SortDescending { get; init; } = false;
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 25;
    public int Max { get; init; } = 50;
}