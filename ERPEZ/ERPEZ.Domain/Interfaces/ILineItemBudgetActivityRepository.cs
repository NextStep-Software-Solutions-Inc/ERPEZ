using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface ILineItemBudgetActivityRepository : IRepository<LineItemBudgetActivity>
{
	Task<LineItemBudgetActivity?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
	Task<List<LineItemBudgetActivity>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);
}