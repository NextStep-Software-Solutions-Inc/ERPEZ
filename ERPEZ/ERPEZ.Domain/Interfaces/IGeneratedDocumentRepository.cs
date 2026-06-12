using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IGeneratedDocumentRepository : IRepository<GeneratedDocument>
{
    Task<List<GeneratedDocument>> GetByOfficeAsync(
        Guid officeId,
        CancellationToken cancellationToken = default);
}