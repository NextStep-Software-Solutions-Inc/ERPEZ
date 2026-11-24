using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IEconomicIndicatorRepository : IRepository<EconomicIndicator>
{
    /// <summary>
    /// Get economic indicator by ID with FiscalYear navigation property included.
    /// </summary>
    Task<EconomicIndicator?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default);
}
