using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class BACResolutionWhereasClauseRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.BACResolutionWhereasClause>(context, sieveProcessor),
      Domain.Interfaces.IBACResolutionWhereasClauseRepository
{
}
