using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ApprovalEventRepository : Repository<ApprovalEvent>, IApprovalEventRepository
{
    private readonly ApplicationDbContext context;

    public ApprovalEventRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
    }

    public async Task<List<ApprovalEvent>> GetApprovalHistoryAsync(Guid ppmpId, CancellationToken cancellationToken = default)
    {
        return await context.Set<ApprovalEvent>()
            .Where(ae => ae.PPMPId == ppmpId && !ae.IsDeleted)
            .OrderBy(ae => ae.Timestamp)
            .ToListAsync(cancellationToken);
    }
}
