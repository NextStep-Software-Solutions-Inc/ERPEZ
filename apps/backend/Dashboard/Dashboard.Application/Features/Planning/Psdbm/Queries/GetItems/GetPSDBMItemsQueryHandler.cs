using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetItems;

public class GetPsdbmItemsQueryHandler(
    IPsdbmQueryService queryService,
    ILogger<GetPsdbmItemsQueryHandler> logger)
    : IRequestHandler<GetPsdbmItemsQuery, ApiResponse<GetPsdbmItemsResponse>>
{
    public async Task<ApiResponse<GetPsdbmItemsResponse>> Handle(
        GetPsdbmItemsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await queryService.GetItemsAsync(request, cancellationToken);
            return ApiResponse<GetPsdbmItemsResponse>.Success(result, "PSDBM items fetched successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve PSDBM items");
            return ApiResponse<GetPsdbmItemsResponse>.Fail($"Failed to retrieve items: {ex.Message}");
        }
    }
}