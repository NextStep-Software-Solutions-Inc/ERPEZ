using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IProcurementProjectRepository : IRepository<ProcurementProject>
{
    Task<ProcurementProject?> GetByConsolidatedPRIdWithResolutionsAsync(Guid consolidatedPRId, CancellationToken cancellationToken = default);
    Task<List<ProcurementProject>> GetByAPPItemIdsWithResolutionsAsync(IEnumerable<Guid> appItemIds, CancellationToken cancellationToken = default);
    Task<ProcurementProject?> GetWithDetailsForUpdateAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProcurementProject?> GetWithPublicDetailsByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ProcurementProject>> GetAllPublicProjectsWithModeAsync(CancellationToken cancellationToken = default);
}