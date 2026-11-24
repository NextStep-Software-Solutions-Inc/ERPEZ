using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IOPCRConsolidationRepository : IRepository<OPCRConsolidation>
{
    Task<OPCRConsolidation?> GetConsolidationWithOPCRsAsync(
        Guid id, CancellationToken cancellationToken = default);
}