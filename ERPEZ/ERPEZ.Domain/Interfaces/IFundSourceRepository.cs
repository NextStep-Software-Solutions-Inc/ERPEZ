namespace ERPEZ.Domain.Interfaces;

public interface IFundSourceRepository : IRepository<Entities.Planning.FundSource>
{
    /// <summary>
    /// Get all fund sources with ParentSource and FiscalYear navigation properties included.
    /// Returns IQueryable for further filtering and pagination.
    /// </summary>
    IQueryable<Entities.Planning.FundSource> GetAllWithNavigation();
}
