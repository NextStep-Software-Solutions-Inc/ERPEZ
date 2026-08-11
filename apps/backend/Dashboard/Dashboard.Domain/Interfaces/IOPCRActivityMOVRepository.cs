using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IOPCRActivityMOVRepository : IRepository<OPCRActivityMOV>
{
    Task<OPCRActivityMOV?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
}
