using ERPEZ.Application.Interfaces;
using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetItems;

public class GetPsdbmItemsQueryHandler(IPhilGepsService philGepsService)
    : IRequestHandler<GetPsdbmItemsQuery, ApiResponse<GetPsdbmItemsResponse>>
{
    public async Task<ApiResponse<GetPsdbmItemsResponse>> Handle(
        GetPsdbmItemsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var items = await philGepsService.GetItemsAsync(
                request.Mode,
                request.Search,
                request.Category,
                request.Max,
                request.Depot,
                cancellationToken);

            var result = new GetPsdbmItemsResponse
            {
                Items      = items,
                TotalItems = items.Count,
                Category   = request.Category,
                SearchTerm = request.Search,
                Mode       = request.Mode,
                Depot      = request.Mode.ToLower() == "main" ? null : request.Depot
            };

            return ApiResponse<GetPsdbmItemsResponse>.Success(result, "Items fetched successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<GetPsdbmItemsResponse>.Fail(
                $"Failed to communicate with PhilGEPS: {ex.Message}");
        }
    }
}