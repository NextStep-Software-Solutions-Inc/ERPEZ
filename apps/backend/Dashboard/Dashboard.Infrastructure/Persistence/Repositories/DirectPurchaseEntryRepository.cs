using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class DirectPurchaseEntryRepository : Repository<DirectPurchaseEntry>, IDirectPurchaseEntryRepository
{
    public DirectPurchaseEntryRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
