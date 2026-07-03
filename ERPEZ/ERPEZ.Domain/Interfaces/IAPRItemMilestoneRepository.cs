using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IAPRItemMilestoneRepository : IRepository<APRItemMilestone>
{
    Task<List<APRItemMilestone>> GetByAPRItemIdAsync(Guid aprItemId, CancellationToken cancellationToken = default);
}
