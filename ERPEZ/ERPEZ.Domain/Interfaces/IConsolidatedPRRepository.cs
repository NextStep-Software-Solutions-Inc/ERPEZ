using ERPEZ.Domain.Entities.Procurement;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Domain.Interfaces;

public interface IConsolidatedPRRepository : IRepository<ConsolidatedPR>
{
    Task<ConsolidatedPR?> GetCPRWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<ConsolidatedPR> Entities, int TotalCount)> GetDetailedPagedAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetCPRsWithDetailsAsync<TDto>(
        SieveModel sieveModel,
        Expression<Func<ConsolidatedPR, TDto>> projection,
        List<Expression<Func<ConsolidatedPR, object>>> includes,
        CancellationToken cancellationToken = default) where TDto : class;
}