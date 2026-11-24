using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface IPPMPItemRepository : IRepository<PPMPItem>
{
    Task<List<PPMPItem>> GetItemsWithAllocationsAsync(Guid ppmpId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<PPMPItem> Entities, int TotalCount)> GetDetailedPagedAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
    Task<PPMPItem?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    
    Task<List<PPMPItem>> GetItemsByExpenditureItemIdAsync(Guid expenditureItemId, CancellationToken cancellationToken = default);
    Task<List<PPMPItem>> GetItemsByPpmpIdsAsync(List<Guid> ppmpIds, CancellationToken cancellationToken = default);
}
