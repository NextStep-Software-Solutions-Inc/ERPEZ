using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class AgencyMasterBudgetRepository : Repository<AgencyMasterBudget>, IAgencyMasterBudgetRepository
{
    private readonly ApplicationDbContext dbContext;

    public AgencyMasterBudgetRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<AgencyMasterBudget?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.AgencyMasterBudgets!
            .Include(x => x.FiscalYear)
            .Include(x => x.FundCluster)
                .ThenInclude(f => f.ParentSource)
            .Include(x => x.FundCluster)
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
            .Include(x => x.FundCluster)
                .ThenInclude(f => f.ParentSource)
            .Include(x => x.FundCluster)
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
}