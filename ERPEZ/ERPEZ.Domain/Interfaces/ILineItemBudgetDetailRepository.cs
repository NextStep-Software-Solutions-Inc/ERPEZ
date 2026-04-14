using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface ILineItemBudgetDetailRepository : IRepository<LineItemBudgetDetail>
{
	Task<LineItemBudgetDetail?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
	Task<List<LineItemBudgetDetail>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);
}