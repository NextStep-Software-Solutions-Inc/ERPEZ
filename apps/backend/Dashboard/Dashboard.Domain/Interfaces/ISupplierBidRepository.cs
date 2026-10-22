using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface ISupplierBidRepository : IRepository<SupplierBid>
{
    /// <summary>
    /// Gets all active bids for the specified RFQ, including Supplier and SupplierBidItems navigation properties.
    /// </summary>
    Task<List<SupplierBid>> GetByRFQIdAsync(Guid rfqId, CancellationToken cancellationToken = default);
}
