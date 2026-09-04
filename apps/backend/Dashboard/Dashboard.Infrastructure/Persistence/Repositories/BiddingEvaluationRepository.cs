using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class BiddingEvaluationRepository : Repository<BiddingEvaluation>, IBiddingEvaluationRepository
{
    private readonly ApplicationDbContext context;

    public BiddingEvaluationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<BiddingEvaluation?> GetByProjectIdWithDetailsAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        return await context.Set<BiddingEvaluation>()
            .Include(e => e.EvaluatedBids)
                .ThenInclude(b => b.Supplier)
            .Include(e => e.EvaluatedBids)
                .ThenInclude(b => b.BidOpeningRecord)
                    .ThenInclude(o => o.BiddingSubmission)
            .Include(e => e.EvaluatedBids)
                .ThenInclude(b => b.PostQualification)
            .Where(e => e.ProcurementProjectId == projectId && !e.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
