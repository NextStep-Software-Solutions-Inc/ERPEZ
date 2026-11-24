using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class UACSCodeSegmentFiscalYearRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.UACSCodeSegmentFiscalYear>(context, sieveProcessor), Domain.Interfaces.IUACSCodeSegmentFiscalYearRepository
{
}
