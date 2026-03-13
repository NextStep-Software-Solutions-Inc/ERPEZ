using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class KPIMeasurementRepository : Repository<Domain.Entities.Planning.KPIMeasurement>, IKPIMeasurementRepository
{
    public KPIMeasurementRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
