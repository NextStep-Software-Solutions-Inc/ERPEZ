using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IAgencyMasterBudgetRepository : IRepository<AgencyMasterBudget>
{
	Task<AgencyMasterBudget?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
	Task<List<AgencyMasterBudget>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);
}