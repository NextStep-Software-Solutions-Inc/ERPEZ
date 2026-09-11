using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IBiddingSubmissionRepository : IRepository<BiddingSubmission>
{
    Task<List<BiddingSubmission>> GetByProjectIdWithDetailsAsync(Guid projectId, CancellationToken cancellationToken = default);
}
