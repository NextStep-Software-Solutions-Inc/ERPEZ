using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OfficeCeilingRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<OfficeCeiling>(context, sieveProcessor), IOfficeCeilingRepository
{
}