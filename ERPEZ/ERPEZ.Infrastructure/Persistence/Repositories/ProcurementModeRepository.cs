using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProcurementModeRepository : Repository<Domain.Entities.Planning.ProcurementMode>, Domain.Interfaces.IProcurementModeRepository
{
    public ProcurementModeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
