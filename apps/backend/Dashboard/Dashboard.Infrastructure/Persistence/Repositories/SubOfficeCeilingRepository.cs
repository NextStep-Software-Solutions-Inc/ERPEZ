using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class SubOfficeCeilingRepository : Repository<SubOfficeCeiling>, ISubOfficeCeilingRepository
{
    private readonly ApplicationDbContext dbContext;
    private readonly ISieveProcessor sieveProcessor;

    public SubOfficeCeilingRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<SubOfficeCeiling?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.SubOfficeCeilings!
            .Include(x => x.OfficeCeiling)
                .ThenInclude(oc => oc.Office)
            .Include(x => x.SubOffice)
            .Include(x => x.FundCluster)
            .Include(x => x.FiscalYear)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<SubOfficeCeiling>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var query = dbContext.SubOfficeCeilings!
            .Include(x => x.OfficeCeiling)
                .ThenInclude(oc => oc.Office)
            .Include(x => x.SubOffice)
            .Include(x => x.FundCluster)
            .Include(x => x.FiscalYear)
            .AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(x => !x.IsDeleted);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<SubOfficeCeiling>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query = dbContext.SubOfficeCeilings!
            .Include(x => x.OfficeCeiling)
                .ThenInclude(oc => oc.Office)
            .Include(x => x.SubOffice)
            .Include(x => x.FundCluster)
            .Include(x => x.FiscalYear)
            .Where(x => !x.IsDeleted)
            .AsSplitQuery()
            .AsNoTracking()
            .AsQueryable();

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var filteredCount = await filteredQuery.CountAsync(cancellationToken);
        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var results = await paginatedQuery.ToListAsync(cancellationToken);

        return (results, filteredCount);
    }
}