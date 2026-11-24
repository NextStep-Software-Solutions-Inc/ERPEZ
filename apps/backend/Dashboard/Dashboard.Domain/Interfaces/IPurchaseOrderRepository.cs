using ERPEZ.Domain.Entities.Procurement;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface IPurchaseOrderRepository : IRepository<PurchaseOrder>
{
    Task<PurchaseOrder?> GetByIdWithItemsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PurchaseOrder?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<PurchaseOrder> Entities, int TotalCount)> GetPagedPurchaseOrdersAsync(SieveModel sieveModel, string? search, CancellationToken cancellationToken = default);
    Task<List<string>> GetAllPoNumbersAsync(CancellationToken cancellationToken = default);
}
