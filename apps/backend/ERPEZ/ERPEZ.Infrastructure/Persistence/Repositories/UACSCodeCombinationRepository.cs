using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class UACSCodeCombinationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.UACSCodeCombination>(context, sieveProcessor), Domain.Interfaces.IUACSCodeCombinationRepository
{
}
