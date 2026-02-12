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
}
