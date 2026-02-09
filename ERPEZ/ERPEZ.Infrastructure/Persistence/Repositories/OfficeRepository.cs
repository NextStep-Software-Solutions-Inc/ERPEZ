using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OfficeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Office>(context, sieveProcessor), IOfficeRepository
{
    public async Task<Office?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Offices
            .Include(o => o.OfficeType)
            .Include(o => o.Organization)
            .Include(o => o.Category)
            .Include(o => o.AdministrativeLevel)
            .Include(o => o.Cluster)
            .Include(o => o.ProcurementWorkflow)
            .Include(o => o.Parent)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<List<Office>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var query = context.Offices
            .Include(o => o.OfficeType)
            .Include(o => o.Organization)
            .Include(o => o.Category)
            .Include(o => o.AdministrativeLevel)
            .Include(o => o.Cluster)
            .Include(o => o.ProcurementWorkflow)
            .Include(o => o.Parent)
            .AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(o => !o.IsDeleted);
        }

        return await query.ToListAsync(cancellationToken);
    }
}
