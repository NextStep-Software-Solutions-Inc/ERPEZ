using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class SupplierCategoryRepository : Repository<SupplierCategory>, ISupplierCategoryRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public SupplierCategoryRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<SupplierCategory?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<SupplierCategory>()
            .Where(sc => sc.Id == id && !sc.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<SupplierCategory>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default)
    {
        return await context.Set<SupplierCategory>()
            .Where(sc => !sc.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = context.Set<SupplierCategory>()
            .Where(sc => sc.Name == name && !sc.IsDeleted);

        if (excludeId.HasValue)
        {
            query = query.Where(sc => sc.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
