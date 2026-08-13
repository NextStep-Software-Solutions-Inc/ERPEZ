using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProcurementPolicyConfigRepository : Repository<ProcurementPolicyConfig>, IProcurementPolicyConfigRepository
{
    private readonly ApplicationDbContext dbContext;

    public ProcurementPolicyConfigRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<ProcurementPolicyConfig?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.ProcurementPolicyConfigs!
            .Include(x => x.FiscalYear)
            .Include(x => x.ProcurementMode)
            .Include(x => x.ProcurementModeThreshold)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);
    }
}
