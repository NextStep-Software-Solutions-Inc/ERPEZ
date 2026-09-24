using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class BiddingSubmissionRepository : Repository<BiddingSubmission>, IBiddingSubmissionRepository
{
    private readonly ApplicationDbContext context;

    public BiddingSubmissionRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<List<BiddingSubmission>> GetByProjectIdWithDetailsAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        return await context.Set<BiddingSubmission>()
            .Include(s => s.Supplier)
            .Include(s => s.BidOpeningRecord)
            .Include(s => s.BiddingSubmissionItems)
            .Include(s => s.PublicSupplierApplication)
                .ThenInclude(a => a!.UploadedDocuments)
                    .ThenInclude(d => d.ChecklistItem)
                        .ThenInclude(c => c.MasterDocumentType)
            .Where(s => s.ProcurementProjectId == projectId && !s.IsDeleted)
            .ToListAsync(cancellationToken);
    }
}
