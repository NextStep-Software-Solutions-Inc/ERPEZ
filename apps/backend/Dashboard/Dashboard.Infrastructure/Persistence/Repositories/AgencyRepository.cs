using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class AgencyRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Agency>(context, sieveProcessor), IAgencyRepository
{
}
