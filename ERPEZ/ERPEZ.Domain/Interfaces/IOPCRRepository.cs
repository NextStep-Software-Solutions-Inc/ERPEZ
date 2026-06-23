using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Domain.Interfaces;

public interface IOPCRRepository : IRepository<OPCR>
{
    Task<OPCR?> GetOPCRWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<OPCR?> GetOPCRWithRatingsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<OPCR> Entities, int TotalCount)> GetDetailedPagedAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
    Task<List<OPCR>> GetDetailedByOfficeAsync(Guid officeId, CancellationToken cancellationToken = default);
    Task<List<OPCR>> GetDetailedByFiscalYearAsync(Guid fiscalYearId, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetOPCRsWithDetailsAsync<TDto>(
        SieveModel sieveModel,
        Expression<Func<OPCR, TDto>> projection,
        List<Expression<Func<OPCR, object>>> includes,
        CancellationToken cancellationToken = default) where TDto : class;
}