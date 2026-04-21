using ERPEZ.Domain.Entities.Planning;
using System.Linq.Expressions;

namespace ERPEZ.Domain.Interfaces;

public interface IAPPPPMPRepository : IRepository<APPPPMP>
{
    /// <summary>
    /// Get all PPMP selections for a specific APP with eager-loaded PPMP details.
    /// </summary>
    Task<List<APPPPMP>> GetSelectionsForAPPAsync(
        Guid appId,
        Expression<Func<APPPPMP, object>>[]? includes = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get paginated PPMP selections for a specific APP with projection.
    /// </summary>
    Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetSelectionsForAPPAsync<TDto>(
        Guid appId,
        Sieve.Models.SieveModel sieveModel,
        Expression<Func<APPPPMP, TDto>> projection,
        CancellationToken cancellationToken = default) where TDto : class;

    /// <summary>
    /// Check if a PPMP is already selected in a specific APP.
    /// </summary>
    Task<bool> IsSelectedAsync(Guid appId, Guid ppmpId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all unique PPMPs selected across all APPs (for read-model aggregations).
    /// </summary>
    Task<List<PPMP>> GetAllSelectedPPMPsAsync(CancellationToken cancellationToken = default);
}
