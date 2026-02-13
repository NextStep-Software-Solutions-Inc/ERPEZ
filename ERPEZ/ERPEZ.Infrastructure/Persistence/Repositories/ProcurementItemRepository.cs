using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProcurementItemRepository : Repository<Domain.Entities.Planning.ProcurementItem>, Domain.Interfaces.IProcurementItemRepository
{
    private readonly ApplicationDbContext dbContext;

    public ProcurementItemRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<Domain.Entities.Planning.ProcurementItem?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.ProcurementItems!
            .Include(pi => pi.ObjectCode)
            .Include(pi => pi.UOM)
            .Include(pi => pi.UNSPSCCode)
            .FirstOrDefaultAsync(pi => pi.Id == id && !pi.IsDeleted, cancellationToken);
    }

    public async Task<List<Domain.Entities.Planning.ProcurementItem>> GetAllWithDetailsAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var query = dbContext.ProcurementItems!
            .Where(pi => !pi.IsDeleted)
            .Include(pi => pi.ObjectCode)
            .Include(pi => pi.UOM)
            .Include(pi => pi.UNSPSCCode)
            .AsQueryable();

        if (!includeInactive)
        {
            query = query.Where(pi => pi.IsActive);
        }

        return await query.ToListAsync(cancellationToken);
    }
}
