using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IApprovalEventRepository : IRepository<ApprovalEvent>
{
    Task<List<ApprovalEvent>> GetApprovalHistoryAsync(Guid ppmpId, CancellationToken cancellationToken = default);
}
