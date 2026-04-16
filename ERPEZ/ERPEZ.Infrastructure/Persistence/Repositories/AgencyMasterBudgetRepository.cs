using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class AgencyMasterBudgetRepository : Repository<AgencyMasterBudget>, IAgencyMasterBudgetRepository
{
    private readonly ApplicationDbContext dbContext;
    private readonly ISieveProcessor sieveProcessor;

    public AgencyMasterBudgetRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<AgencyMasterBudget?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.AgencyMasterBudgets!
            .Include(x => x.FiscalYear)
            .Include(x => x.FundSource)
                .ThenInclude(f => f.ParentSource)
            .Include(x => x.FundSource)
                .ThenInclude(f => f.FiscalYear)
            .Include(x => x.OfficeCeilings)
                .ThenInclude(oc => oc.Office)
            .Include(x => x.OfficeCeilings)
                .ThenInclude(oc => oc.SubOfficeCeilings)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<AgencyMasterBudget>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var query = dbContext.AgencyMasterBudgets!
            .Include(x => x.FiscalYear)
            .Include(x => x.FundSource)
                .ThenInclude(f => f.ParentSource)
            .Include(x => x.FundSource)
                .ThenInclude(f => f.FiscalYear)
            .Include(x => x.OfficeCeilings)
                .ThenInclude(oc => oc.Office)
            .Include(x => x.OfficeCeilings)
                .ThenInclude(oc => oc.SubOfficeCeilings)
            .AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(x => !x.IsDeleted);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<AgencyMasterBudget>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query = dbContext.AgencyMasterBudgets!
            .Include(x => x.FiscalYear)
            .Include(x => x.FundSource)
                .ThenInclude(f => f.ParentSource)
            .Include(x => x.FundSource)
                .ThenInclude(f => f.FiscalYear)
            .Include(x => x.OfficeCeilings)
                .ThenInclude(oc => oc.Office)
            .Include(x => x.OfficeCeilings)
                .ThenInclude(oc => oc.SubOfficeCeilings)
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