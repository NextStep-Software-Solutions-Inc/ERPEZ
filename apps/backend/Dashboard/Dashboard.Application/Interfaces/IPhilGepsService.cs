using ERPEZ.Application.Features.Planning.Psdbm.Dtos;

namespace ERPEZ.Application.Interfaces;

public interface IPhilGepsService
{
    Task<List<PsdbmItemDto>> GetItemsAsync(
        string mode,
        string? search,
        string? category,
        int max,
        string? depot,
        CancellationToken cancellationToken = default);

    Task<List<PsdbmCategoryDto>> GetCategoriesAsync(
        string mode,
        CancellationToken cancellationToken = default);

    Task<List<PsdbmDepotDto>> GetDepotsAsync(
        CancellationToken cancellationToken = default);
}