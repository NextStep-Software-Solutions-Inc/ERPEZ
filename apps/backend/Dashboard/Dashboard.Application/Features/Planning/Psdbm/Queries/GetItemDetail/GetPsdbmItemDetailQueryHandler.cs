using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetItemDetail;

public class GetPsdbmItemDetailQueryHandler(
    IPsdbmQueryService queryService,
    ILogger<GetPsdbmItemDetailQueryHandler> logger)
    : IRequestHandler<GetPsdbmItemDetailQuery, ApiResponse<PsdbmProductDetailDto>>
{
    public async Task<ApiResponse<PsdbmProductDetailDto>> Handle(
        GetPsdbmItemDetailQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var detail = await queryService.GetItemDetailAsync(request.Id, request.ItemCode, cancellationToken);
            if (detail == null)
            {
                return ApiResponse<PsdbmProductDetailDto>.Fail("PSDBM Product not found.");
            }

            return ApiResponse<PsdbmProductDetailDto>.Success(detail, "PSDBM Product detail retrieved successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve PSDBM product details");
            return ApiResponse<PsdbmProductDetailDto>.Fail($"Failed to retrieve product details: {ex.Message}");
        }
    }
}
