using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class UACSValidationRuleRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.UACSValidationRule>(context, sieveProcessor), Domain.Interfaces.IUACSValidationRuleRepository
{
}
