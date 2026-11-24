using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class AOBRepository : Repository<AOB>, IAOBRepository
{
    private readonly ApplicationDbContext context;

    public AOBRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<AOB?> GetByIdWithAwardedItemsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<AOB>()
            .Include(a => a.AOBAwardedItems)
                .ThenInclude(ai => ai.RFQItem)
                    .ThenInclude(ri => ri.CPRItem)
                        .ThenInclude(ci => ci.PRItem)
                            .ThenInclude(pri => pri.PPMPItem)
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, cancellationToken);
    }

    public async Task<List<AOB>> GetApprovedAvailableForPOAsync(IEnumerable<Guid> excludedIds, CancellationToken cancellationToken = default)
    {
        var excludedList = excludedIds.ToList();
        return await context.Set<AOB>()
            .Include(a => a.AOBAwardedItems)
                .ThenInclude(ai => ai.WinningSupplier)
            .Include(a => a.AOBAwardedItems)
                .ThenInclude(ai => ai.RFQItem)
                    .ThenInclude(ri => ri.CPRItem)
                        .ThenInclude(ci => ci.PRItem)
                            .ThenInclude(pri => pri.PPMPItem)
            .Where(a => a.Status == StatusEnum.Approved && !excludedList.Contains(a.Id) && !a.IsDeleted)
            .OrderByDescending(a => a.AOBDate)
            .ToListAsync(cancellationToken);
    }
}

