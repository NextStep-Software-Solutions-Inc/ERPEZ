using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WFPObjectiveActivityExpenditureRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.WFPObjectiveActivityExpenditure>(context, sieveProcessor),
      Domain.Interfaces.IWFPObjectiveActivityExpenditureRepository
{
}
