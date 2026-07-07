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
            .Where(a => a.FYActiveKPIId == fyActiveKPIId && !a.IsDeleted)
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
            .AsSplitQuery()
            .AsNoTracking()
            .AsQueryable();

        // ✅ Manually handle nested filters Sieve can't resolve
        query = ApplyCustomFilters(query, sieveModel.Filters);

        // ✅ Strip custom keys so Sieve doesn't choke on them
        var sieveFilters = StripCustomFilters(sieveModel.Filters);
        var sieveModelForProcessor = new SieveModel
        {
            Page = sieveModel.Page,
            PageSize = sieveModel.PageSize,
            Sorts = sieveModel.Sorts,
            Filters = sieveFilters  // cleaned filter string
        };

        // ✅ Use the cleaned model
        var filteredQuery = sieveProcessor.Apply(sieveModelForProcessor, query, applyPagination: false);
        var filteredCount = await filteredQuery.CountAsync(cancellationToken);
        var paginatedQuery = sieveProcessor.Apply(sieveModelForProcessor, filteredQuery, applyFiltering: false, applySorting: false);
        var results = await paginatedQuery.ToListAsync(cancellationToken); // ✅ add this

        return (results, filteredCount);
    }

    private static string? StripCustomFilters(string? filters)
    {
        if (string.IsNullOrWhiteSpace(filters))
            return filters;

        var terms = filters.Split([',', ';'], StringSplitOptions.RemoveEmptyEntries);
        var remaining = terms.Where(t =>
            !CustomFilterKeys.Any(key =>
                t.IndexOf(key, StringComparison.OrdinalIgnoreCase) >= 0));

        var result = string.Join(",", remaining);
        return string.IsNullOrWhiteSpace(result) ? null : result;
    }

    private static readonly string[] CustomFilterKeys =
    [
        "fyActiveKPI.fiscalYearId",
        "fyActiveKPI.functionCategory"
    ];

    private static IQueryable<Domain.Entities.Planning.KPIAssignment> ApplyCustomFilters(
        IQueryable<Domain.Entities.Planning.KPIAssignment> query, string? filters)
    {
        if (string.IsNullOrWhiteSpace(filters))
            return query;

        var terms = filters.Split([',', ';'], StringSplitOptions.RemoveEmptyEntries);

        foreach (var term in terms)
        {
            if (TryExtractGuid(term, "fyActiveKPI.fiscalYearId", out var fiscalYearId))
                query = query.Where(a => a.FYActiveKPI != null && a.FYActiveKPI.FiscalYearId == fiscalYearId);

            else if (TryExtractString(term, "fyActiveKPI.functionCategory", out var functionCategory))
                query = query.Where(a => a.FYActiveKPI != null && a.FYActiveKPI.FunctionCategory == functionCategory);
        }

        return query;
    }

    private static bool TryExtractGuid(string term, string key, out Guid value)
    {
        value = Guid.Empty;
        // Sieve operators: ==, !=, etc. We only need equality here.
        var prefix = key + "==";
        var idx = term.IndexOf(prefix, StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return false;
        var raw = term[(idx + prefix.Length)..].Trim();
        return Guid.TryParse(raw, out value);
    }

    private static bool TryExtractString(string term, string key, out string value)
    {
        value = string.Empty;
        var prefix = key + "==";
        var idx = term.IndexOf(prefix, StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return false;
        value = term[(idx + prefix.Length)..].Trim();
        return !string.IsNullOrEmpty(value);
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
            .AsSplitQuery()
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, cancellationToken);
    }
}
