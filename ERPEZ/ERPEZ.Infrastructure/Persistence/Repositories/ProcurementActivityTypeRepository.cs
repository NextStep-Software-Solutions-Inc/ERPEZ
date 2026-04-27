using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProcurementActivityTypeRepository : Repository<Domain.Entities.Planning.ProcurementActivityType>, Domain.Interfaces.IProcurementActivityTypeRepository
{
    public ProcurementActivityTypeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
