using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IKPITargetRepository : IRepository<KPITarget>
{
    Task<(KPITarget? KPITarget, decimal TotalAllocated)> GetKPITargetWithTotalAllocatedAsync(Guid id, CancellationToken cancellationToken = default);
}

