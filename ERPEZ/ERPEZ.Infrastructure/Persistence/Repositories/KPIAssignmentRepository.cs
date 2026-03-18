using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class KPIAssignmentRepository : Repository<Domain.Entities.Planning.KPIAssignment>, IKPIAssignmentRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public KPIAssignmentRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<List<Domain.Entities.Planning.KPIAssignment>> GetAssignmentsByFYActiveKPIIdAsync(Guid fyActiveKPIId, CancellationToken cancellationToken = default)
    {
        return await context.Set<Domain.Entities.Planning.KPIAssignment>()
            .Where(a => a.FYActiveKPIId == fyActiveKPIId)
            .Include(a => a.Office)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<Domain.Entities.Planning.KPIAssignment>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query = context.Set<Domain.Entities.Planning.KPIAssignment>()
            .Include(a => a.Office!)
                .ThenInclude(o => o.OfficeType)
            .Include(a => a.Office!)
                .ThenInclude(o => o.Organization)
            .Include(a => a.Office!)
                .ThenInclude(o => o.Category)
            .Include(a => a.Office!)
                .ThenInclude(o => o.AdministrativeLevel)
            .Include(a => a.Office!)
                .ThenInclude(o => o.Cluster)
            .Include(a => a.Office!)
                .ThenInclude(o => o.ProcurementWorkflow)
            .Include(a => a.Office!)
                .ThenInclude(o => o.Parent)
            .Include(a => a.Office!)
                .ThenInclude(o => o.Positions)
            .Include(a => a.FYActiveKPI!)
                .ThenInclude(f => f.FiscalYear)
            .Include(a => a.FYActiveKPI!)
                .ThenInclude(f => f.MFOPAP)
            .Include(a => a.FYActiveKPI!)
                .ThenInclude(f => f.FYActiveKPIMeasurements)
            .Include(a => a.FYActiveKPI!)
                .ThenInclude(f => f.MasterKPI!)
                    .ThenInclude(k => k.MFOPAP)
            .Include(a => a.FYActiveKPI!)
                .ThenInclude(f => f.MasterKPI!)
                    .ThenInclude(k => k.Attributes)
            .Include(a => a.FYActiveKPI!)
                .ThenInclude(f => f.MasterKPI!)
                    .ThenInclude(k => k.SDGs)
            .Where(a => !a.IsDeleted)
            .AsNoTracking()
            .AsQueryable();

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var filteredCount = await filteredQuery.CountAsync(cancellationToken);
        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var results = await paginatedQuery.ToListAsync(cancellationToken);

        return (results, filteredCount);
    }

    public async Task<Domain.Entities.Planning.KPIAssignment?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<Domain.Entities.Planning.KPIAssignment>()
            .Include(a => a.Office!)
                .ThenInclude(o => o.OfficeType)
            .Include(a => a.Office!)
                .ThenInclude(o => o.Organization)
            .Include(a => a.Office!)
                .ThenInclude(o => o.Category)
            .Include(a => a.Office!)
                .ThenInclude(o => o.AdministrativeLevel)
            .Include(a => a.Office!)
                .ThenInclude(o => o.Cluster)
            .Include(a => a.Office!)
                .ThenInclude(o => o.ProcurementWorkflow)
            .Include(a => a.Office!)
                .ThenInclude(o => o.Parent)
            .Include(a => a.Office!)
                .ThenInclude(o => o.Positions)
            .Include(a => a.FYActiveKPI!)
                .ThenInclude(f => f.FiscalYear)
            .Include(a => a.FYActiveKPI!)
                .ThenInclude(f => f.MFOPAP)
            .Include(a => a.FYActiveKPI!)
                .ThenInclude(f => f.FYActiveKPIMeasurements)
            .Include(a => a.FYActiveKPI!)
                .ThenInclude(f => f.MasterKPI!)
                    .ThenInclude(k => k.MFOPAP)
            .Include(a => a.FYActiveKPI!)
                .ThenInclude(f => f.MasterKPI!)
                    .ThenInclude(k => k.Attributes)
            .Include(a => a.FYActiveKPI!)
                .ThenInclude(f => f.MasterKPI!)
                    .ThenInclude(k => k.SDGs)
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, cancellationToken);
    }
}
