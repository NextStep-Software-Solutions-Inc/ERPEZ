using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProcurementModeRepository : Repository<Domain.Entities.Planning.ProcurementMode>, Domain.Interfaces.IProcurementModeRepository
{
    private readonly ApplicationDbContext dbContext;

    public ProcurementModeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<Domain.Entities.Planning.ProcurementMode?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.ProcurementModes!
            .Include(x => x.ProcurementCategory)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<bool> HasReferencesByProcurementCategoryAsync(Guid procurementCategoryId, CancellationToken cancellationToken = default)
    {
        return await dbContext.ProcurementModes!
            .AnyAsync(pm => pm.ProcurementCategoryId == procurementCategoryId, cancellationToken);
    }
}
