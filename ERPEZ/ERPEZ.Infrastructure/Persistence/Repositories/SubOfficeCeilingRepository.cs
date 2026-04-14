using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class SubOfficeCeilingRepository : Repository<SubOfficeCeiling>, ISubOfficeCeilingRepository
{
    private readonly ApplicationDbContext dbContext;

    public SubOfficeCeilingRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
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
}