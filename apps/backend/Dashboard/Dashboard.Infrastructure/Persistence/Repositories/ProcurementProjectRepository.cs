using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProcurementProjectRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<ProcurementProject>(context, sieveProcessor), IProcurementProjectRepository
{
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
}