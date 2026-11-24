using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ItemPriceRepository : Repository<ItemPrice>, IItemPriceRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public ItemPriceRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<ItemPrice?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<ItemPrice>()
            .Include(ip => ip.ProcurementItem)
                .ThenInclude(pi => pi!.UOM)
            .Include(ip => ip.FiscalYear)
            .Where(ip => ip.Id == id && !ip.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<ItemPrice>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default)
    {
        return await context.Set<ItemPrice>()
            .Include(ip => ip.ProcurementItem)
                .ThenInclude(pi => pi!.UOM)
            .Include(ip => ip.FiscalYear)
            .Where(ip => !ip.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(Guid procurementItemId, Guid fiscalYearId, CancellationToken cancellationToken = default)
    {
        return await context.Set<ItemPrice>()
            .AnyAsync(ip => ip.ProcurementItemId == procurementItemId 
                && ip.FiscalYearId == fiscalYearId 
                && !ip.IsDeleted, cancellationToken);
    }
}
