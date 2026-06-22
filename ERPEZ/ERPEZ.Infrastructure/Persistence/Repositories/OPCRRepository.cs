using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using System.Linq.Expressions;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCRRepository : Repository<OPCR>, IOPCRRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor      sieveProcessor;

    public OPCRRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context        = context;
        this.sieveProcessor = sieveProcessor;
    }

    // ── Shared include chain ──────────────────────────────────────────────────
    // Used by both GetOPCRWithDetailsAsync and GetOPCRWithRatingsAsync.
    // Includes everything needed for both document generation variants.

    private IQueryable<OPCR> BuildDetailedQuery(IQueryable<OPCR>? source = null)
    {
        var q = source ?? context.Set<OPCR>();

        return q
            // Office + Agency
            .Include(o => o.Office)
                .ThenInclude(of => of.Organization)

            // Fiscal Year + function allocation percentages
            .Include(o => o.FiscalYear)
                .ThenInclude(fy => fy.FunctionAllocations)

            // FYActiveKPI → direct MFOPAP (fallback path)
            .Include(o => o.OPCRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.KPIAssignment)
                    .ThenInclude(a => a.FYActiveKPI!)
                        .ThenInclude(fy => fy.MFOPAP)

            // FYActiveKPI → MasterKPI → MFOPAP (preferred path)
            .Include(o => o.OPCRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.KPIAssignment)
                    .ThenInclude(a => a.FYActiveKPI!)
                        .ThenInclude(fy => fy.MasterKPI)
                            .ThenInclude(k => k!.MFOPAP)

            // FYActiveKPI → MasterKPI → Attributes (SDA/Goals/PREXC column)
            .Include(o => o.OPCRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.KPIAssignment)
                    .ThenInclude(a => a.FYActiveKPI!)
                        .ThenInclude(fy => fy.MasterKPI)
                            .ThenInclude(k => k!.Attributes)

            // Activities → PAP departments → Office
            .Include(o => o.OPCRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.OPCRActivities.Where(a => !a.IsDeleted))
                    .ThenInclude(a => a.OPCRPAPDepartments)
                        .ThenInclude(d => d.Office)

            // Ratings → KPIMeasurement → RatingScaleTemplate → RatingScaleLevels
            // Included in both variants; empty collection when no ratings exist
            .Include(o => o.OPCRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.OPCRItemRatings.Where(r => !r.IsDeleted))
                    .ThenInclude(r => r.FYActiveKPIMeasurement)
                        .ThenInclude(m => m.RatingScaleTemplate)
                            .ThenInclude(t => t!.RatingScaleLevels)

            .AsSplitQuery();
    }

    // ── Document generation ───────────────────────────────────────────────────

    public async Task<OPCR?> GetOPCRWithDetailsAsync(
        Guid id, CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery()
            .Where(o => o.Id == id && !o.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    // Ratings variant uses the same include chain — ratings collection
    // is already loaded; if empty, mapper produces no rating columns
    public async Task<OPCR?> GetOPCRWithRatingsAsync(
        Guid id, CancellationToken cancellationToken = default) =>
        await GetOPCRWithDetailsAsync(id, cancellationToken);

    // ── Paged ──────────────────────────────────────────────────────────────────

    public async Task<(IReadOnlyList<OPCR> Entities, int TotalCount)> GetDetailedPagedAsync(
        SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query          = BuildDetailedQuery(
                                context.Set<OPCR>().AsNoTracking().Where(o => !o.IsDeleted));
        var filteredQuery  = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount     = await filteredQuery.CountAsync(cancellationToken);
        var pagedQuery     = sieveProcessor.Apply(sieveModel, filteredQuery,
                                applyFiltering: false, applySorting: false);
        var entities       = await pagedQuery.ToListAsync(cancellationToken);
        return (entities, totalCount);
    }

    // ── Filtered lists ─────────────────────────────────────────────────────────

    public async Task<List<OPCR>> GetDetailedByOfficeAsync(
        Guid officeId, CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery(
                context.Set<OPCR>().Where(o => !o.IsDeleted && o.OfficeId == officeId))
            .ToListAsync(cancellationToken);
    }

    public async Task<List<OPCR>> GetDetailedByFiscalYearAsync(
        Guid fiscalYearId, CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery(
                context.Set<OPCR>().Where(o => !o.IsDeleted && o.FiscalYearId == fiscalYearId))
            .ToListAsync(cancellationToken);
    }

    // ── Projection ──────────────────────────────────────────────────────────────

    public async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetOPCRsWithDetailsAsync<TDto>(
        SieveModel sieveModel,
        Expression<Func<OPCR, TDto>> projection,
        List<Expression<Func<OPCR, object>>> includes,
        CancellationToken cancellationToken = default) where TDto : class
    {
        IQueryable<OPCR> query = context.Set<OPCR>().AsNoTracking().Where(e => !e.IsDeleted);

        foreach (var include in includes)
            query = query.Include(include);

        var filteredQuery  = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount     = await filteredQuery.CountAsync(cancellationToken);
        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery,
                                applyFiltering: false, applySorting: false);
        var entities       = await paginatedQuery.Select(projection).ToListAsync(cancellationToken);

        return (entities, totalCount);
    }
}