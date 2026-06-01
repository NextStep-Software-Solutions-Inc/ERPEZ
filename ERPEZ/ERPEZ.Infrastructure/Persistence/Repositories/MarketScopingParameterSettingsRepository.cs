using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class MarketScopingParameterSettingsRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Domain.Entities.Planning.MarketScopingParameterSettings>(context, sieveProcessor), IMarketScopingParameterSettingsRepository
{
}
