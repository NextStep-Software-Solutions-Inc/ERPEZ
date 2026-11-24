using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IMasterDocumentTypeRepository : IRepository<MasterDocumentType>
{
    Task<MasterDocumentType?> GetByIdWithItemsAsync(
        Guid id, CancellationToken cancellationToken = default);

    Task<bool> IsNameDuplicateAsync(
        string name, Guid? excludeId = null, CancellationToken cancellationToken = default);
}