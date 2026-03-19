using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class FYActiveKPIMeasurementRepository : Repository<Domain.Entities.Planning.FYActiveKPIMeasurement>, IFYActiveKPIMeasurementRepository
{
    public FYActiveKPIMeasurementRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
