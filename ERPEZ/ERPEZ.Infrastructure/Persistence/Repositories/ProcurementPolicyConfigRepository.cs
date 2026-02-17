using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProcurementPolicyConfigRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<ProcurementPolicyConfig>(context, sieveProcessor), IProcurementPolicyConfigRepository
{
    public async Task<ProcurementPolicyConfig?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.ProcurementPolicyConfigs!
            .Include(x => x.FiscalYear)
            .Include(x => x.ProcurementMode)
            .Include(x => x.ProcurementModeThreshold)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);
    }
}
