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
}