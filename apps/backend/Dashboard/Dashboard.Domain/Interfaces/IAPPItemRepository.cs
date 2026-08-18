using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface IAPPItemRepository : IRepository<APPItem>
{
    /// <summary>
    /// Returns all APPItems for the given APP with the full include chain required
    /// for BAC aggregation: PPMPItem, allocations, LIB chain (for AllotmentClass),
    /// ProcurementMode, FundSource, Office, and ProcurementSchedules.
    /// </summary>
    Task<List<APPItem>> GetAPPItemsWithDetailsAsync(Guid appId, CancellationToken cancellationToken = default);

    Task<APPItem?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<APPItem> Entities, int TotalCount)> GetAllWithDetailsAsync(
        SieveModel sieveModel,
        CancellationToken cancellationToken = default);

    Task<List<APPItem>> GetAPPItemsByPPMPIdsAsync(Guid appId, IEnumerable<Guid> ppmpIds, CancellationToken cancellationToken = default);
}
