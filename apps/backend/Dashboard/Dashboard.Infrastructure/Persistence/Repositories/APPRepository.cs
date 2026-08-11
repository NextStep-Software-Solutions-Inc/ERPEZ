using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using System.Linq.Expressions;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class APPRepository : Repository<APP>, IAPPRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public APPRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    private IQueryable<APP> BuildDetailedQuery(IQueryable<APP>? query = null)
    {
        var baseQuery = query ?? context.Set<APP>();

        return baseQuery
            .Include(a => a.FiscalYear)
            .Include(a => a.SourceAPP)
            .Include(a => a.APPItems
                .Where(item => !item.IsDeleted))
                .ThenInclude(item => item.PPMPItem)
                    .ThenInclude(ppmpItem => ppmpItem.PPMPItemAllocations)
            .Include(a => a.APPItems
                .Where(item => !item.IsDeleted))
                .ThenInclude(item => item.ProcurementMode)
            .Include(a => a.APPItems
                .Where(item => !item.IsDeleted))
                .ThenInclude(item => item.FundSource)
            .Include(a => a.APPItems
                .Where(item => !item.IsDeleted))
                .ThenInclude(item => item.Office)
            .Include(a => a.APPItems
                .Where(item => !item.IsDeleted))
                .ThenInclude(item => item.PPMPItem)
                    .ThenInclude(ppmpItem => ppmpItem.APPProcurementSchedules)
                        .ThenInclude(schedule => schedule.ProcurementActivityType)
            .Include(a => a.APPPPMPs)
                .ThenInclude(s => s.PPMP)
                    .ThenInclude(ppmp => ppmp!.Office)
            .Include(a => a.APPPPMPs)
                .ThenInclude(s => s.PPMP)
                    .ThenInclude(ppmp => ppmp!.FiscalYear)
            .Include(a => a.APPPPMPs)
                .ThenInclude(s => s.PPMP)
                    .ThenInclude(ppmp => ppmp!.FundSource)
            .AsSplitQuery();
    }

    public async Task<(IReadOnlyList<APP> Entities, int TotalCount)> GetAllWithDetailsAsync(
        SieveModel sieveModel,
        CancellationToken cancellationToken = default)
    {
        var query = BuildDetailedQuery(context.Set<APP>()
            .AsNoTracking()
            .Where(a => !a.IsDeleted));

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var entities = await sieveProcessor.Apply(sieveModel, filteredQuery).ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    public async Task<APP?> GetAPPWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery()
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, cancellationToken);
    }

    public async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAPPsByOfficeAsync<TDto>(
        Guid officeId,
        SieveModel sieveModel,
        Expression<Func<APP, TDto>> projection,
        CancellationToken cancellationToken = default) where TDto : class
    {
        var query = BuildDetailedQuery(context.Set<APP>()
            .AsNoTracking()
            .Where(a => !a.IsDeleted && (a.APPItems.Any(i => i.OfficeId == officeId) || a.APPPPMPs.Any(p => p.PPMP != null && p.PPMP.OfficeId == officeId))));

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        
        var entities = await sieveProcessor
            .Apply(sieveModel, filteredQuery)
            .Select(projection)
            .ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    public async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAPPsByFiscalYearAsync<TDto>(
        Guid fiscalYearId,
        SieveModel sieveModel,
        Expression<Func<APP, TDto>> projection,
        CancellationToken cancellationToken = default) where TDto : class
    {
        var query = BuildDetailedQuery(context.Set<APP>()
            .AsNoTracking()
            .Where(a => a.FiscalYearId == fiscalYearId && !a.IsDeleted));

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        
        var entities = await sieveProcessor
            .Apply(sieveModel, filteredQuery)
            .Select(projection)
            .ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    public async Task<bool> HasAPPNumberAsync(string appNumber, CancellationToken cancellationToken = default)
    {
        return await context.Set<APP>()
            .AnyAsync(a => a.APPNumber == appNumber && !a.IsDeleted, cancellationToken);
    }

    public async Task<bool> HasAPPNumberAsync(string appNumber, Guid excludeId, CancellationToken cancellationToken = default)
    {
        return await context.Set<APP>()
            .AnyAsync(a => a.APPNumber == appNumber && a.Id != excludeId && !a.IsDeleted, cancellationToken);
    }

    public async Task<int> GetNextVersionNumberAsync(Guid sourceAppId, CancellationToken cancellationToken = default)
    {
        var sourceApp = await context.Set<APP>()
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == sourceAppId && !a.IsDeleted, cancellationToken);

        if (sourceApp == null) return 1;

        var rootAppId = sourceApp.SourceAPPId ?? sourceApp.Id;

        var maxVersion = await context.Set<APP>()
            .AsNoTracking()
            .Where(a => !a.IsDeleted && (a.Id == rootAppId || a.SourceAPPId == rootAppId || a.SourceAPPId == sourceAppId))
            .Where(a => a.VersionNumber.HasValue)
            .Select(a => a.VersionNumber!.Value)
            .DefaultIfEmpty(0)
            .MaxAsync(cancellationToken);

        return maxVersion + 1;
    }

    public async Task<ERPEZ.Domain.Models.APPAnalyticsData?> GetAPPAnalyticsAsync(Guid appId, CancellationToken cancellationToken = default)
    {
        var app = await BuildDetailedQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == appId && !a.IsDeleted, cancellationToken);

        if (app == null) return null;

        var appItems = app.APPItems.Where(i => !i.IsDeleted).ToList();
        var ppmps = app.APPPPMPs.Where(p => !p.IsDeleted && p.PPMP != null).Select(p => p.PPMP!).ToList();

        var totalAmount = appItems.Sum(item =>
            item.PPMPItem?.PPMPItemAllocations.Where(a => !a.IsDeleted).Sum(a => a.Amount) ?? 0);

        var officeBreakdown = appItems
            .GroupBy(i => new { Id = i.OfficeId, Name = i.Office?.Name ?? i.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP?.Office?.Name ?? "Unknown Office" })
            .Select(g => new ERPEZ.Domain.Models.OfficeBreakdownData(
                g.Key.Id,
                g.Key.Name,
                g.Count(),
                g.Sum(item => item.PPMPItem?.PPMPItemAllocations.Where(a => !a.IsDeleted).Sum(a => a.Amount) ?? 0)
            )).ToList();

        var categoryBreakdown = appItems
            .GroupBy(i => i.PPMPItem?.CSEItemId != null ? "Common-Use Supplies" : "Non-CSE Supplies & Services")
            .Select(g => new ERPEZ.Domain.Models.CategoryBreakdownData(
                g.Key,
                g.Count(),
                g.Sum(item => item.PPMPItem?.PPMPItemAllocations.Where(a => !a.IsDeleted).Sum(a => a.Amount) ?? 0)
            )).ToList();

        var modeBreakdown = appItems
            .GroupBy(i => i.ProcurementMode?.Name ?? "Unspecified Mode")
            .Select(g => new ERPEZ.Domain.Models.ProcurementTypeBreakdownData(
                g.Key,
                g.Count(),
                g.Sum(item => item.PPMPItem?.PPMPItemAllocations.Where(a => !a.IsDeleted).Sum(a => a.Amount) ?? 0)
            )).ToList();

        var fundBreakdown = appItems
            .GroupBy(i => i.FundSource?.Name ?? "Unspecified Fund Source")
            .Select(g => new ERPEZ.Domain.Models.FundSourceBreakdownData(
                g.Key,
                g.Count(),
                g.Sum(item => item.PPMPItem?.PPMPItemAllocations.Where(a => !a.IsDeleted).Sum(a => a.Amount) ?? 0)
            )).ToList();

        decimal mooe = totalAmount;
        decimal co = 0;
        decimal ps = 0;

        return new ERPEZ.Domain.Models.APPAnalyticsData
        {
            AppId = app.Id,
            APPNumber = app.APPNumber,
            Name = app.Name,
            FiscalYear = app.FiscalYear?.Year.ToString() ?? string.Empty,
            APPType = app.APPType,
            TotalEstimatedBudget = totalAmount,
            TotalItemsCount = appItems.Count,
            TotalPpmpsCount = ppmps.Count,
            TotalOfficesCount = officeBreakdown.Count,
            BreakdownByOffice = officeBreakdown,
            BreakdownByCategory = categoryBreakdown,
            BreakdownByProcurementType = modeBreakdown,
            BreakdownByFundSource = fundBreakdown,
            FinancialBreakdown = new ERPEZ.Domain.Models.FinancialBreakdownData(ps, mooe, co)
        };
    }
}
