using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Domain.Interfaces;

public interface IProcurementActivityTypeRepository : IRepository<ProcurementActivityType>
{
    Task<bool> ExistsWithSystemRoleAsync(
        ProcurementActivitySystemRole role, CancellationToken cancellationToken = default);
}
