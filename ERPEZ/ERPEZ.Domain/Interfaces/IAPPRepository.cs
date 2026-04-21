using ERPEZ.Domain.Entities.Planning;
using System.Linq.Expressions;

namespace ERPEZ.Domain.Interfaces;

public interface IAPPRepository : IRepository<APP>
{
    /// <summary>
    /// Get APP with all related details: FiscalYear, Office, APPItems, PPMP selections.
    /// </summary>
    Task<APP?> GetAPPWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get paginated APPs with eager-loaded relationships for a specific Office.
    /// </summary>
    Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAPPsByOfficeAsync<TDto>(
        Guid officeId,
        Sieve.Models.SieveModel sieveModel,
        Expression<Func<APP, TDto>> projection,
        CancellationToken cancellationToken = default) where TDto : class;

    /// <summary>
    /// Get paginated APPs with eager-loaded relationships for a specific FiscalYear.
    /// </summary>
    Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAPPsByFiscalYearAsync<TDto>(
        Guid fiscalYearId,
        Sieve.Models.SieveModel sieveModel,
        Expression<Func<APP, TDto>> projection,
        CancellationToken cancellationToken = default) where TDto : class;

    /// <summary>
    /// Check if an APP with the given APPNumber exists.
    /// </summary>
    Task<bool> HasAPPNumberAsync(string appNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if an APP with the given APPNumber exists, excluding a specific APP (for updates).
    /// </summary>
    Task<bool> HasAPPNumberAsync(string appNumber, Guid excludeId, CancellationToken cancellationToken = default);
}
