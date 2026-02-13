using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProcurementCategoryRepository : Repository<Domain.Entities.Planning.ProcurementCategory>, Domain.Interfaces.IProcurementCategoryRepository
{
    public ProcurementCategoryRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
