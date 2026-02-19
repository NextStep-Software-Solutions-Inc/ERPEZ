using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class UNSPSCCodeRepository : Repository<Domain.Entities.Planning.UNSPSCCode>, Domain.Interfaces.IUNSPSCCodeRepository
{
    private readonly ApplicationDbContext dbContext;

    public UNSPSCCodeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<bool> IsInUseAsync(Guid unspscCodeId, CancellationToken cancellationToken = default)
    {
        return await dbContext.ProcurementItems!
            .AnyAsync(pi => pi.UNSPSCCodeId == unspscCodeId && pi.IsActive && !pi.IsDeleted, cancellationToken);
    }

    public async Task<Domain.Entities.Planning.UNSPSCCode?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.UNSPSCCodes!
            .Include(x => x.Parent)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<Domain.Entities.Planning.UNSPSCCode>> GetChildrenAsync(Guid parentId, CancellationToken cancellationToken = default)
    {
        return await dbContext.UNSPSCCodes!
            .Where(x => x.ParentId == parentId)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasChildrenAsync(Guid unspscCodeId, CancellationToken cancellationToken = default)
    {
        return await dbContext.UNSPSCCodes!
            .AnyAsync(x => x.ParentId == unspscCodeId, cancellationToken);
    }
}
