using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Features.Planning.Psdbm.Queries.GetItems;

namespace ERPEZ.Application.Interfaces;

public interface IPsdbmQueryService
{
    Task<GetPsdbmItemsResponse> GetItemsAsync(
        GetPsdbmItemsQuery query,
        CancellationToken cancellationToken = default);

    Task<PsdbmProductDetailDto?> GetItemDetailAsync(
        Guid? id,
        string? itemCode,
        CancellationToken cancellationToken = default);

    Task<List<PsdbmCategoryDto>> GetCategoriesAsync(
        string mode,
        CancellationToken cancellationToken = default);

    Task<List<PsdbmDepotDto>> GetDepotsAsync(
        string? mode = null,
        CancellationToken cancellationToken = default);
}
