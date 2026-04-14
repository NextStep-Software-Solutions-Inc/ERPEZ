using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class SubOfficeCeilingRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<SubOfficeCeiling>(context, sieveProcessor), ISubOfficeCeilingRepository
{
}