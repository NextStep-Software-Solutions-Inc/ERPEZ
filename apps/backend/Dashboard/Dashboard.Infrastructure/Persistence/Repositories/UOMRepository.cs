using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class UOMRepository : Repository<Domain.Entities.Planning.UOM>, Domain.Interfaces.IUOMRepository
{
    private readonly ApplicationDbContext dbContext;

    public UOMRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<bool> IsInUseAsync(Guid uomId, CancellationToken cancellationToken = default)
    {
        return await dbContext.ProcurementItems!
            .AnyAsync(pi => pi.UOMId == uomId && pi.IsActive && !pi.IsDeleted, cancellationToken);
    }

    public async Task<Domain.Entities.Planning.UOM?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.UOMs!
            .Include(x => x.Parent)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<bool> HasChildrenAsync(Guid uomId, CancellationToken cancellationToken = default)
    {
        return await dbContext.UOMs!
            .AnyAsync(x => x.ParentId == uomId, cancellationToken);
    }
}
