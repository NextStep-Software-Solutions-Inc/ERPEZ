using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ResolutionClauseRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<ResolutionClause>(context, sieveProcessor), IResolutionClauseRepository
{
}
