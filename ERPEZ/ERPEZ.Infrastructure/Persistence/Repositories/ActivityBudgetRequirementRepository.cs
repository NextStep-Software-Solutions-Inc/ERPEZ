using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ActivityBudgetRequirementRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.ActivityBudgetRequirement>(context, sieveProcessor),
      Domain.Interfaces.IActivityBudgetRequirementRepository
{
}
