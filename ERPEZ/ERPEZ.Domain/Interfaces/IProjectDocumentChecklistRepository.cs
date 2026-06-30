using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IProjectDocumentChecklistRepository : IRepository<ProjectDocumentChecklist>
{
    Task<List<ProjectDocumentChecklist>> GetByProjectIdAsync(
        Guid projectId, CancellationToken cancellationToken = default);

    /// <summary>Single checklist item with MasterDocumentType included — for bid notice download.</summary>
    Task<ProjectDocumentChecklist?> GetByIdWithMasterTypeAsync(
        Guid id, Guid procurementProjectId, CancellationToken cancellationToken = default);
}