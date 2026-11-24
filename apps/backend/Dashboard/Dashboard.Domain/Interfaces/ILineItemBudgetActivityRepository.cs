using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface ILineItemBudgetActivityRepository : IRepository<LineItemBudgetActivity>
{
	Task<LineItemBudgetActivity?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
	Task<LineItemBudgetActivity?> GetByIdForUpdateAsync(Guid id, CancellationToken cancellationToken = default);
	Task<(IEnumerable<LineItemBudgetActivity>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
	Task<List<LineItemBudgetActivity>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);
}