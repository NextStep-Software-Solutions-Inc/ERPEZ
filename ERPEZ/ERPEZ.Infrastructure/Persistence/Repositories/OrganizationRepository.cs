using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OrganizationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Organization>(context, sieveProcessor), IOrganizationRepository
{
}
