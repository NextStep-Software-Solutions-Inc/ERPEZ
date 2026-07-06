using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IPublicSupplierApplicationRepository : IRepository<PublicSupplierApplication>
{
    Task<PublicSupplierApplication?> GetWithDocumentsByIdAsync(
        Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid projectId, string tinNumber, CancellationToken cancellationToken);
}