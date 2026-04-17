using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IPPMPItemRepository : IRepository<PPMPItem>
{
    Task<List<PPMPItem>> GetItemsWithAllocationsAsync(Guid ppmpId, CancellationToken cancellationToken = default);
    
    Task<List<PPMPItem>> GetItemsByExpenditureItemIdAsync(Guid expenditureItemId, CancellationToken cancellationToken = default);
}
