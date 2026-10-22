using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class UACSCodeCombinationFiscalYearRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.UACSCodeCombinationFiscalYear>(context, sieveProcessor), Domain.Interfaces.IUACSCodeCombinationFiscalYearRepository
{
}
