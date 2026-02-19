using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OfficeRepository : Repository<Office>, IOfficeRepository
{
    private readonly ApplicationDbContext dbContext;
    private readonly ISieveProcessor sieveProcessor;

    public OfficeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<Office?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Offices!
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
        var query = dbContext.Offices!
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

    public async Task<(IEnumerable<Office>, int)> GetAllWithDetailsAsync(Sieve.Models.SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query = dbContext.Offices!
            .Include(o => o.OfficeType)
            .Include(o => o.Organization)
            .Include(o => o.Category)
            .Include(o => o.AdministrativeLevel)
            .Include(o => o.Cluster)
            .Include(o => o.ProcurementWorkflow)
            .Include(o => o.Parent)
            .Where(o => !o.IsDeleted)
            .AsNoTracking()
            .AsQueryable();

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var filteredCount = await filteredQuery.CountAsync(cancellationToken);
        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var results = await paginatedQuery.ToListAsync(cancellationToken);

        return (results, filteredCount);
    }
}
