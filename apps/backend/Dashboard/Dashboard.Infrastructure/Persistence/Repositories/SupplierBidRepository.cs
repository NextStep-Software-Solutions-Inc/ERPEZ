using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class SupplierBidRepository : Repository<SupplierBid>, ISupplierBidRepository
{
    private readonly ApplicationDbContext dbContext;

    public SupplierBidRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<List<SupplierBid>> GetByRFQIdAsync(Guid rfqId, CancellationToken cancellationToken = default)
    {
        return await dbContext.SupplierBids!
            .Include(b => b.Supplier)
            .Include(b => b.SupplierBidItems)
            .Where(b => b.RFQId == rfqId && !b.IsDeleted)
            .ToListAsync(cancellationToken);
    }
}
