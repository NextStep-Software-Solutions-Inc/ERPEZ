using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PRItemRepository : Repository<PRItem>, IPRItemRepository
{
    private readonly ApplicationDbContext context;

    public PRItemRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<List<PRItem>> GetByIdsWithPPMPItemAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default)
    {
        var idList = ids.ToList();
        return await context.Set<PRItem>()
            .Include(pi => pi.PPMPItem)
            .Where(pi => idList.Contains(pi.Id) && !pi.IsDeleted)
            .ToListAsync(cancellationToken);
    }
}
