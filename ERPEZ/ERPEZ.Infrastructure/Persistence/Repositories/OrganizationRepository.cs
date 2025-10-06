using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OrganizationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Domain.Entities.Planning.Organization>(context, sieveProcessor), Domain.Interfaces.IOrganizationRepository
{
}
