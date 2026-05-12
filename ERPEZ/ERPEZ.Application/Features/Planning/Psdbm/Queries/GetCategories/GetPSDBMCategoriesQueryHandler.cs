using ERPEZ.Application.Interfaces;
using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Psdbm.Queries.GetCategories;

public class GetPsdbmCategoriesQueryHandler(IPhilGepsService philGepsService)
    : IRequestHandler<GetPsdbmCategoriesQuery, ApiResponse<List<PsdbmCategoryDto>>>
{
    public async Task<ApiResponse<List<PsdbmCategoryDto>>> Handle(
        GetPsdbmCategoriesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var categories = await philGepsService.GetCategoriesAsync(
                request.Mode, cancellationToken);

            return ApiResponse<List<PsdbmCategoryDto>>.Success(
                categories, "Categories fetched successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<List<PsdbmCategoryDto>>.Fail(
                $"Failed to communicate with PhilGEPS: {ex.Message}");
        }
    }
}