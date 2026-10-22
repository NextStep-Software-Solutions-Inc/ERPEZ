using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PurchaseOrderItemRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<PurchaseOrderItem>(context, sieveProcessor), IPurchaseOrderItemRepository
{
}
