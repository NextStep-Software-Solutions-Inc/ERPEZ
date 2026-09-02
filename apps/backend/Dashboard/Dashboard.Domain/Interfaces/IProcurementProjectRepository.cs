using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IProcurementProjectRepository : IRepository<ProcurementProject>
{
    Task<ProcurementProject?> GetWithPublicDetailsByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ProcurementProject>> GetAllPublicProjectsWithModeAsync(CancellationToken cancellationToken = default);
}