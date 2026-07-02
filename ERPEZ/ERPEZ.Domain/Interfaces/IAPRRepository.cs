using ERPEZ.Domain.Entities.Procurement;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Domain.Interfaces;

public interface IAPRRepository : IRepository<APR>
{
    Task<(IReadOnlyList<APR> Entities, int TotalCount)> GetAllWithDetailsAsync(
        SieveModel sieveModel,
        CancellationToken cancellationToken = default);

    Task<APR?> GetAPRWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAPRsByOfficeAsync<TDto>(
        Guid officeId,
        SieveModel sieveModel,
        Expression<Func<APR, TDto>> projection,
        CancellationToken cancellationToken = default) where TDto : class;

    Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAPRsByFiscalYearAsync<TDto>(
        Guid fiscalYearId,
        SieveModel sieveModel,
        Expression<Func<APR, TDto>> projection,
        CancellationToken cancellationToken = default) where TDto : class;

    Task<bool> HasAPRNumberAsync(string aprNumber, CancellationToken cancellationToken = default);

    Task<bool> HasAPRNumberAsync(string aprNumber, Guid excludeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Count of DRAFT APRs for a given office within a fiscal year — used to generate the
    /// next office-scoped draft sequence (APR-{FY}-DRAFT-{OfficeCode}-{seq}).
    /// </summary>
    Task<int> CountDraftsForOfficeAsync(Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Count of non-draft (submitted/approved/returned) APRs across all offices within a fiscal
    /// year — used to generate the next flat FY sequence on submission (APR-{FY}-{seq}).
    /// </summary>
    Task<int> CountSubmittedForFiscalYearAsync(Guid fiscalYearId, CancellationToken cancellationToken = default);
}
