using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class CSEItemRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<CSEItem>(context, sieveProcessor), ICSEItemRepository
{
}
