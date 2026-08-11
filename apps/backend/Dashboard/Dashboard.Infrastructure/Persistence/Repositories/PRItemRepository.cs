using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PRItemRepository : Repository<PRItem>, IPRItemRepository
{
    public PRItemRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}