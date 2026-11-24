using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetCategories;

public class GetPsdbmCategoriesQueryHandler(
    IPsdbmQueryService queryService,
    ILogger<GetPsdbmCategoriesQueryHandler> logger)
    : IRequestHandler<GetPsdbmCategoriesQuery, ApiResponse<List<PsdbmCategoryDto>>>
{
    public async Task<ApiResponse<List<PsdbmCategoryDto>>> Handle(
        GetPsdbmCategoriesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var categories = await queryService.GetCategoriesAsync(request.Mode, cancellationToken);
            return ApiResponse<List<PsdbmCategoryDto>>.Success(categories, "Categories fetched successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to retrieve PSDBM categories");
            return ApiResponse<List<PsdbmCategoryDto>>.Fail($"Failed to retrieve categories: {ex.Message}");
        }
    }
}