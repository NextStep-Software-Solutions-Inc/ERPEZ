using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class StepRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.Step>(context, sieveProcessor),
      Domain.Interfaces.IStepRepository
{
}
