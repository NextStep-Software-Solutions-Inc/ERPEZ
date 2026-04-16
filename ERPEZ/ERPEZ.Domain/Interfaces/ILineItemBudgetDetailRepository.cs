using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface ILineItemBudgetDetailRepository : IRepository<LineItemBudgetDetail>
{
	Task<LineItemBudgetDetail?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
	Task<(IEnumerable<LineItemBudgetDetail>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
	Task<List<LineItemBudgetDetail>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);
	Task<List<LineItemBudgetDetail>> GetDetailsByLibIdAsync(Guid libId, CancellationToken cancellationToken = default);
}