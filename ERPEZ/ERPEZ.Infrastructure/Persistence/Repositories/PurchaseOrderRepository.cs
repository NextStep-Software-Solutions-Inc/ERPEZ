using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PurchaseOrderRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<PurchaseOrder>(context, sieveProcessor), IPurchaseOrderRepository
{
    public async Task<PurchaseOrder?> GetByIdWithItemsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<PurchaseOrder>()
            .Include(po => po.PurchaseOrderItems)
            .FirstOrDefaultAsync(po => po.Id == id && !po.IsDeleted, cancellationToken);
    }
}
