using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProcurementProjectRepository : Repository<ProcurementProject>, IProcurementProjectRepository
{
    private readonly ApplicationDbContext context;

    public ProcurementProjectRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<ProcurementProject?> GetByConsolidatedPRIdWithResolutionsAsync(
        Guid consolidatedPRId, CancellationToken cancellationToken = default)
    {
        return await context.Set<ProcurementProject>()
            .AsNoTracking()
            .Include(p => p.BACResolutions.Where(r => !r.IsDeleted))
            .Where(p => p.ConsolidatedPRId == consolidatedPRId && p.Status != "Cancelled" && !p.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<List<ProcurementProject>> GetByAPPItemIdsWithResolutionsAsync(
        IEnumerable<Guid> appItemIds, CancellationToken cancellationToken = default)
    {
        var idList = appItemIds.ToList();
        return await context.Set<ProcurementProject>()
            .AsNoTracking()
            .Include(p => p.BACResolutions.Where(r => !r.IsDeleted))
            .Where(p => p.Status != "Cancelled" && !p.IsDeleted && (
                (p.APPItemId.HasValue && idList.Contains(p.APPItemId.Value)) ||
                p.APPItemLinks.Any(l => idList.Contains(l.APPItemId))
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<ProcurementProject?> GetWithDetailsForUpdateAsync(
        Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<ProcurementProject>()
            .Include(p => p.APPItemLinks)
                .ThenInclude(l => l.APPItem)
            .Include(p => p.BACResolutions)
                .ThenInclude(r => r.WhereasClauseItems)
            .Include(p => p.BACResolutions)
                .ThenInclude(r => r.ClauseLinks)
            .AsSplitQuery()
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);
    }

    public async Task<ProcurementProject?> GetWithPublicDetailsByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.ProcurementProjects!
            .Include(p => p.BiddingDocument)
            .Include(p => p.ProcurementMode)
            .Include(p => p.ConsolidatedPR)
            .Include(p => p.BiddingActivitySchedules)
                .ThenInclude(s => s.ProcurementActivityType)
            .Include(p => p.ProjectDocumentChecklists)
                .ThenInclude(c => c.MasterDocumentType)
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);
    }

    public async Task<List<ProcurementProject>> GetAllPublicProjectsWithModeAsync(CancellationToken cancellationToken = default)
    {
        return await context.ProcurementProjects!
            .Include(p => p.BiddingDocument)
            .Include(p => p.ProcurementMode)
            .Include(p => p.ConsolidatedPR)
            .Where(p => !p.IsDeleted && (
                (p.BiddingDocument != null && p.BiddingDocument.Status == "Posted") 
                || p.Status == "ROUTED_TO_PORTAL" 
                || p.Status == "Active" 
                || p.Status == "Published" 
                || p.Status == "Open"
                || p.Status == "ClosingSoon"
                || p.Status == "Closed"))
            .ToListAsync(cancellationToken);
    }

    public async Task<ProcurementProject?> GetWithAwardDetailsByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<ProcurementProject>()
            .Include(p => p.EndUserRepresentative)
            .Include(p => p.ProcurementMode)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.PPMPItem)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.APP)
            .Include(p => p.APPItem)
                .ThenInclude(ai => ai!.Office)
            .Include(p => p.APPItemLinks)
                .ThenInclude(l => l.APPItem)
                    .ThenInclude(ai => ai.PPMPItem)
            .Include(p => p.APPItemLinks)
                .ThenInclude(l => l.APPItem)
                    .ThenInclude(ai => ai.APP)
            .Include(p => p.ConsolidatedPR)
            .AsSplitQuery()
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);
    }

    public async Task<List<ProcurementProject>> GetByIdsWithAPPItemLinksAsync(IEnumerable<Guid> projectIds, CancellationToken cancellationToken = default)
    {
        var idList = projectIds.ToList();
        return await context.Set<ProcurementProject>()
            .Include(p => p.APPItemLinks)
            .Where(p => idList.Contains(p.Id) && !p.IsDeleted)
            .ToListAsync(cancellationToken);
    }
}