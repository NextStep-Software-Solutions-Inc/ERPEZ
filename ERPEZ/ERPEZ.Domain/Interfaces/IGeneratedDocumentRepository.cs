using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IGeneratedDocumentRepository : IRepository<GeneratedDocument>
{
    Task<List<GeneratedDocument>> GetByAgencyAsync(
        Guid agencyId,
        CancellationToken cancellationToken = default);
}