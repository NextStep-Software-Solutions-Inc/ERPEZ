using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface ILineItemBudgetRepository : IRepository<LineItemBudget>
{
	Task<LineItemBudget?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
	Task<List<LineItemBudget>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);
}