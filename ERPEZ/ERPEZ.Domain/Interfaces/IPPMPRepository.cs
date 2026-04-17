using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Domain.Interfaces;

public interface IPPMPRepository : IRepository<PPMP>
{
    Task<PPMP?> GetPPMPWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<PPMP> Entities, int TotalCount)> GetDetailedPagedAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
    Task<List<PPMP>> GetDetailedByOfficeAsync(Guid officeId, CancellationToken cancellationToken = default);
    Task<List<PPMP>> GetDetailedByFiscalYearAsync(Guid fiscalYearId, CancellationToken cancellationToken = default);
    
    Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetPPMPsWithDetailsAsync<TDto>(
        SieveModel sieveModel,
        Expression<Func<PPMP, TDto>> projection,
        List<Expression<Func<PPMP, object>>> includes,
        CancellationToken cancellationToken = default) where TDto : class;
}
