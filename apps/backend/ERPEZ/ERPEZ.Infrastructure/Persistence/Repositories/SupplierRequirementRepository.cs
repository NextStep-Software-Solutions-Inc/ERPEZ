using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class SupplierRequirementRepository : Repository<SupplierRequirement>, ISupplierRequirementRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public SupplierRequirementRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<SupplierRequirement?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<SupplierRequirement>()
            .Include(sr => sr.Supplier)
            .Where(sr => sr.Id == id && !sr.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<SupplierRequirement>> GetBySupplierIdAsync(Guid supplierId, CancellationToken cancellationToken = default)
    {
        return await context.Set<SupplierRequirement>()
            .Where(sr => sr.SupplierId == supplierId && !sr.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> AllMandatoryRequirementsVerifiedAsync(Guid supplierId, CancellationToken cancellationToken = default)
    {
        var requirements = await GetBySupplierIdAsync(supplierId, cancellationToken);
        
        // If there are no requirements, return false (cannot approve without requirements)
        if (!requirements.Any())
            return false;

        // Check if all requirements are verified
        return requirements.All(r => r.IsVerified);
    }
}
