using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IUOMRepository : IRepository<UOM>
{
    /// <summary>
    /// Check if UOM is in use by any active procurement items.
    /// </summary>
    Task<bool> IsInUseAsync(Guid uomId, CancellationToken cancellationToken = default);
}
