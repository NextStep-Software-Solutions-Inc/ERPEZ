using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;

using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ItemCategoryRepository : Repository<ItemCategory>, IItemCategoryRepository
{
    public ItemCategoryRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : base(context, sieveProcessor)
    {
    }
}
