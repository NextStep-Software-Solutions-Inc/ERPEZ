using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IFiscalYearRepository : IRepository<FiscalYear>
{
    Task<FiscalYear?> GetWithAllocationsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<FiscalYear?> GetByYearAsync(int year, CancellationToken cancellationToken = default);
}
