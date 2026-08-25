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

    public async Task<ProcurementProject?> GetPublicDetailByIdAsync(
        Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<ProcurementProject>()
            .AsNoTracking()
            .Where(p => p.Id == id && !p.IsDeleted)
            .Include(p => p.ProcurementMode)
            .Include(p => p.BiddingDocument)
            .Include(p => p.BiddingActivitySchedules)
                .ThenInclude(s => s.ProcurementActivityType)
            .Include(p => p.ProjectDocumentChecklists)
                .ThenInclude(c => c.MasterDocumentType)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ProcurementProject?> GetForApplicationSubmissionAsync(
        Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<ProcurementProject>()
            .Where(p => p.Id == id && !p.IsDeleted)
            .Include(p => p.BiddingDocument)
            .Include(p => p.BiddingActivitySchedules)
                .ThenInclude(s => s.ProcurementActivityType)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ProcurementProject?> GetWithBACResolutionsAsync(
        Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<ProcurementProject>()
            .Where(p => p.Id == id && !p.IsDeleted)
            .Include(p => p.BACResolutions)
                .ThenInclude(r => r.WhereasClauseItems)
            .FirstOrDefaultAsync(cancellationToken);
    }
}