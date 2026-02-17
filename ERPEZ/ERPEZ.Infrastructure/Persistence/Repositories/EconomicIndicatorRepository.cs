using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class EconomicIndicatorRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<EconomicIndicator>(context, sieveProcessor), IEconomicIndicatorRepository
{
    public async Task<EconomicIndicator?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.EconomicIndicators!
            .Include(x => x.FiscalYear)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);
    }
}
