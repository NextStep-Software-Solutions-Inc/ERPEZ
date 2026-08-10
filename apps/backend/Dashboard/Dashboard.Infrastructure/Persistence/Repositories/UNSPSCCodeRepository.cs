using Microsoft.EntityFrameworkCore;
using Sieve.Services;
using Sieve.Models;
using ERPEZ.Domain.Interfaces;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class UNSPSCCodeRepository : Repository<Domain.Entities.Planning.UNSPSCCode>, Domain.Interfaces.IUNSPSCCodeRepository
{
    private readonly ApplicationDbContext dbContext;
    private readonly ISieveProcessor sieveProcessor;

    public UNSPSCCodeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
        this.sieveProcessor = sieveProcessor;
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

    public async Task<(IReadOnlyList<UNSPSCCodeWithParentName> Entities, int TotalCount)> GetAllWithParentNamesAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query = from code in dbContext.UNSPSCCodes!.AsNoTracking().Where(x => !x.IsDeleted)
                    join parent in dbContext.UNSPSCCodes!.AsNoTracking().Where(x => !x.IsDeleted) 
                        on code.ParentId equals parent.Id into parentGroup
                    from parent in parentGroup.DefaultIfEmpty()
                    select new UNSPSCCodeWithParentName
                    {
                        Id = code.Id,
                        Code = code.Code,
                        Name = code.Name,
                        Description = code.Description,
                        Level = code.Level,
                        IsActive = code.IsActive,
                        ParentId = code.ParentId,
                        ParentName = parent != null ? parent.Name : null,
                        CreatedAt = code.CreatedAt,
                        UpdatedAt = code.UpdatedAt
                    };

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedResult = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);

        var entities = await paginatedResult.ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    public async Task<bool> HasChildrenAsync(Guid unspscCodeId, CancellationToken cancellationToken = default)
    {
        return await dbContext.UNSPSCCodes!
            .AnyAsync(x => x.ParentId == unspscCodeId, cancellationToken);
    }
}
