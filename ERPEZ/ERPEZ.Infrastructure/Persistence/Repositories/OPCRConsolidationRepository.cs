using Sieve.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCRConsolidationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<OPCRConsolidation>(context, sieveProcessor), IOPCRConsolidationRepository
{
}