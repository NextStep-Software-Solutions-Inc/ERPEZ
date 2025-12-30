using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WFPObjectiveTargetExpenditureRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.WFPObjectiveTargetExpenditure>(context, sieveProcessor),
      Domain.Interfaces.IWFPObjectiveTargetExpenditureRepository
{
}
