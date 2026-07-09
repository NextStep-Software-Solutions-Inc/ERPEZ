using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PurchaseOrderRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<PurchaseOrder>(context, sieveProcessor), IPurchaseOrderRepository
{
}
