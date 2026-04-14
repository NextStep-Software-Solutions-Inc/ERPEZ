using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OfficeCeilingRepository : Repository<OfficeCeiling>, IOfficeCeilingRepository
{
    private readonly ApplicationDbContext dbContext;

    public OfficeCeilingRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
    }

    public async Task<OfficeCeiling?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.OfficeCeilings!
            .Include(x => x.FiscalYear)
            .Include(x => x.Office)
            .Include(x => x.AgencyMasterBudget)
                .ThenInclude(amb => amb.FundCluster)
            .Include(x => x.AgencyMasterBudget)
                .ThenInclude(amb => amb.FiscalYear)
            .Include(x => x.SubOfficeCeilings)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<List<OfficeCeiling>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var query = dbContext.OfficeCeilings!
            .Include(x => x.FiscalYear)
            .Include(x => x.Office)
            .Include(x => x.AgencyMasterBudget)
                .ThenInclude(amb => amb.FundCluster)
            .Include(x => x.AgencyMasterBudget)
                .ThenInclude(amb => amb.FiscalYear)
            .Include(x => x.SubOfficeCeilings)
            .AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(x => !x.IsDeleted);
        }

        return await query.ToListAsync(cancellationToken);
    }
}