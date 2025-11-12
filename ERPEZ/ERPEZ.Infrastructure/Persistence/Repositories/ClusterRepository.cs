using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ClusterRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.Cluster>(context, sieveProcessor), 
      Domain.Interfaces.IClusterRepository
{
}
