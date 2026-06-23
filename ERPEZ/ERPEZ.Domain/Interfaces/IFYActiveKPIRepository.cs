using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IFYActiveKPIRepository : IRepository<FYActiveKPI>
{
    Task<FYActiveKPI?> GetFYActiveKPIWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns the latest FYActiveKPI snapshot per master KPI for a source fiscal year,
    /// including FYActiveKPIMeasurements for clone operations.
    /// </summary>
    Task<IReadOnlyDictionary<Guid, FYActiveKPI>> GetLatestSnapshotsByMasterKPIIdsAsync(
        Guid fiscalYearId,
        IReadOnlyCollection<Guid> masterKPIIds,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns paginated FYActiveKPIs not yet assigned or shopped by the given office,
    /// with Sieve filtering, sorting, and pagination applied inside the method.
    /// </summary>
    Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAvailableForOfficeAsync<TDto>(
        Sieve.Models.SieveModel sieveModel,
        Guid officeId,
        System.Linq.Expressions.Expression<Func<FYActiveKPI, TDto>> projection,
        CancellationToken cancellationToken = default);
}

