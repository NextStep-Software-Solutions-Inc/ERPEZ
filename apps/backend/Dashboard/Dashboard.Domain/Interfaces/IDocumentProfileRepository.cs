using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IDocumentProfileRepository : IRepository<DocumentProfile>
{
    Task<DocumentProfile?> GetByIdWithItemsAsync(
        Guid id, CancellationToken cancellationToken = default);
}