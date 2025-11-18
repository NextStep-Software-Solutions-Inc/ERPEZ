using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class FundSourceRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Domain.Entities.Planning.FundSource>(context, sieveProcessor), Domain.Interfaces.IFundSourceRepository
{
}
