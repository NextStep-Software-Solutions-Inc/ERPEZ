using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProcurementModeThresholdRepository : Repository<Domain.Entities.Planning.ProcurementModeThreshold>, Domain.Interfaces.IProcurementModeThresholdRepository
{
    public ProcurementModeThresholdRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
