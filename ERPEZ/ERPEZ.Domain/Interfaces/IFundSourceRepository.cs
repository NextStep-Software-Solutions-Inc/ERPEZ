using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface IFundSourceRepository : IRepository<Entities.Planning.FundSource>
{
    /// <summary>
    /// Get all fund sources with ParentSource and FiscalYear navigation properties included.
    /// Returns IQueryable for further filtering and pagination.
    /// </summary>
    IQueryable<Entities.Planning.FundSource> GetAllWithNavigation();

    /// <summary>
    /// Get paged fund sources with navigation properties and total count for pagination.
    /// </summary>
    Task<(List<Entities.Planning.FundSource> Items, int TotalCount)> GetPagedWithNavigationAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
}
