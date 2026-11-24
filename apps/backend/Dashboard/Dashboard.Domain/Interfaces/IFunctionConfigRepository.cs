using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IFunctionConfigRepository : IRepository<FunctionConfig>
{
    /// <summary>
    /// Get function config by ID with FiscalYear navigation property included.
    /// </summary>
    Task<FunctionConfig?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default);
}
