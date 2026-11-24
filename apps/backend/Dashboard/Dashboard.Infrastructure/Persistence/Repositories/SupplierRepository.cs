using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class SupplierRepository : Repository<Supplier>, ISupplierRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public SupplierRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }
    public async Task<List<Supplier>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken = default)
    {
        var idList = ids.ToList();
        if (idList.Count == 0)
            return [];

        return await context.Set<Supplier>()
            .Where(s => idList.Contains(s.Id) && !s.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<Supplier?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<Supplier>()
            .Include(s => s.SupplierCategory)
            .Include(s => s.SupplierRequirements)
            .Where(s => s.Id == id && !s.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<Supplier>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default)
    {
        return await context.Set<Supplier>()
            .Include(s => s.SupplierCategory)
            .Include(s => s.SupplierRequirements)
            .Where(s => !s.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByTINAsync(string tinNumber, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = context.Set<Supplier>()
            .Where(s => s.TINNumber == tinNumber && !s.IsDeleted);

        if (excludeId.HasValue)
        {
            query = query.Where(s => s.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> ExistsByBusinessPermitAsync(string businessPermitNo, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = context.Set<Supplier>()
            .Where(s => s.BusinessPermitNo == businessPermitNo && !s.IsDeleted);

        if (excludeId.HasValue)
        {
            query = query.Where(s => s.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
