using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IFYActiveKPIRepository : IRepository<FYActiveKPI>
{
    Task<FYActiveKPI?> GetFYActiveKPIWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
}
