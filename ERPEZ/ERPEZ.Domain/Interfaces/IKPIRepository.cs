using ERPEZ.Domain.Entities.Planning;
using System.Linq.Expressions;

namespace ERPEZ.Domain.Interfaces;

public interface IKPIRepository : IRepository<KPI>
{
    Task<KPI?> GetKPIWithDetailsAsync(Guid id, CancellationToken cancellationToken = default); Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAllKPIsWithDetailsAsync<TDto>(
        Sieve.Models.SieveModel sieveModel,
        Expression<Func<KPI, TDto>> projection,
        List<Expression<Func<KPI, object>>> includes,
        CancellationToken cancellationToken = default) where TDto : class;
}

