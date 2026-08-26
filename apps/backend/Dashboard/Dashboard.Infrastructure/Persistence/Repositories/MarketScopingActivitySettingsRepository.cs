using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class MarketScopingActivitySettingsRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Domain.Entities.Planning.MarketScopingActivitySettings>(context, sieveProcessor), IMarketScopingActivitySettingsRepository
{
}
