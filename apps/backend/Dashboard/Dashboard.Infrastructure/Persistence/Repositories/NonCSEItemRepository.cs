using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class NonCSEItemRepository : Repository<NonCSEItem>, INonCSEItemRepository
{
    private readonly ApplicationDbContext context;

    public NonCSEItemRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<List<NonCSEItem>> GetActiveItemsAsync(CancellationToken cancellationToken = default)
    {
        return await context.Set<NonCSEItem>()
            .Include(n => n.UOM)
            .Include(n => n.ItemRequest)
            .Where(n => !n.IsDeleted)
            .OrderBy(n => n.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<NonCSEItem?> GetByIdWithRelationsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<NonCSEItem>()
            .Include(n => n.UOM)
            .FirstOrDefaultAsync(n => n.Id == id && !n.IsDeleted, cancellationToken);
    }
}
