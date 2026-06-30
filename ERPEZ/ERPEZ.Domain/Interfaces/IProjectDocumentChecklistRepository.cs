using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IProjectDocumentChecklistRepository : IRepository<ProjectDocumentChecklist>
{
    Task<List<ProjectDocumentChecklist>> GetByProjectIdAsync(
        Guid projectId, CancellationToken cancellationToken = default);
}