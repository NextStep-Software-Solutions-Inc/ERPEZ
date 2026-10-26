using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class UACSCodeSegmentRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.UACSCodeSegment>(context, sieveProcessor), Domain.Interfaces.IUACSCodeSegmentRepository
{
}
