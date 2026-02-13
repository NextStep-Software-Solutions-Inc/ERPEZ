using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IUNSPSCCodeRepository : IRepository<UNSPSCCode>
{
    /// <summary>
    /// Check if UNSPSC Code is in use by any active procurement items.
    /// </summary>
    Task<bool> IsInUseAsync(Guid unspscCodeId, CancellationToken cancellationToken = default);
}
