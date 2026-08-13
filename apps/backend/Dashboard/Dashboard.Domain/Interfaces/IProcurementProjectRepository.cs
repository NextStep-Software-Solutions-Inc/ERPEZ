using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IProcurementProjectRepository : IRepository<ProcurementProject>
{
    /// <summary>
    /// Full detail load for the public portal — includes mode, PBD, schedules with
    /// activity types, and document checklist with master document types.
    /// </summary>
    Task<ProcurementProject?> GetPublicDetailByIdAsync(
        Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Minimal load for the apply endpoint — includes only PBD and schedules,
    /// since checklist items are validated via a separate repository call.
    /// </summary>
    Task<ProcurementProject?> GetForApplicationSubmissionAsync(
        Guid id, CancellationToken cancellationToken = default);
}