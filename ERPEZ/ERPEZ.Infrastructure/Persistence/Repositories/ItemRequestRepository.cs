using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ItemRequestRepository : Repository<ItemRequest>, IItemRequestRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public ItemRequestRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<List<ItemRequest>> GetPendingRequestsAsync(CancellationToken cancellationToken = default)
    {
        return await context.Set<ItemRequest>()
            .Include(ir => ir.Office)
            .Include(ir => ir.UOM)
            .Include(ir => ir.ProcurementCategory)
            .Where(ir => ir.Status == "Pending" && !ir.IsDeleted)
            .OrderBy(ir => ir.RequestDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ItemRequest>> GetRequestsByOfficeAsync(Guid officeId, CancellationToken cancellationToken = default)
    {
        return await context.Set<ItemRequest>()
            .Include(ir => ir.UOM)
            .Include(ir => ir.ProcurementCategory)
            .Where(ir => ir.OfficeId == officeId && !ir.IsDeleted)
            .OrderByDescending(ir => ir.RequestDate)
            .ToListAsync(cancellationToken);
    }
}
