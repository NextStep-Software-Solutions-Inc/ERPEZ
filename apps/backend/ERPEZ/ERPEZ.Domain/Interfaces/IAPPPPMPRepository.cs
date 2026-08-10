using ERPEZ.Domain.Entities.Planning;
using System.Linq.Expressions;

namespace ERPEZ.Domain.Interfaces;

public interface IAPPPPMPRepository : IRepository<APPPPMP>
{
    /// <summary>
    /// Get all APPPPMP links for a specific APP with eager-loaded PPMP details.
    /// </summary>
    Task<List<APPPPMP>> GetByAPPAsync(
        Guid appId,
        Expression<Func<APPPPMP, object>>[]? includes = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get paginated APPPPMP links for a specific APP with projection.
    /// </summary>
    Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetByAPPAsync<TDto>(
        Guid appId,
        Sieve.Models.SieveModel sieveModel,
        Expression<Func<APPPPMP, TDto>> projection,
        CancellationToken cancellationToken = default) where TDto : class;

    /// <summary>
    /// Check if a PPMP is already linked to a specific APP.
    /// </summary>
    Task<bool> ExistsInAPPAsync(Guid appId, Guid ppmpId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all unique PPMPs linked across all APPs (for read-model aggregations).
    /// </summary>
    Task<List<PPMP>> GetAllLinkedPPMPsAsync(CancellationToken cancellationToken = default);
}
