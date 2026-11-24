using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class BACResolutionClauseLinkRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<BACResolutionClauseLink>(context, sieveProcessor), IBACResolutionClauseLinkRepository
{
}
