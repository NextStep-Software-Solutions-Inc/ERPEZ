using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IItemRequestRepository : IRepository<ItemRequest>
{
    Task<List<ItemRequest>> GetPendingRequestsAsync(CancellationToken cancellationToken = default);
    
    Task<List<ItemRequest>> GetRequestsByOfficeAsync(Guid officeId, CancellationToken cancellationToken = default);
}
