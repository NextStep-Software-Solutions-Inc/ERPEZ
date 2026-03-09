using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IWorkflowMatrixRepository : IRepository<WorkflowMatrix>
{
    /// <summary>
    /// Get workflow matrix by ID with FiscalYear, Office, and Position navigation properties included.
    /// Actual users are resolved at runtime via PersonnelPosition lookups.
    /// </summary>
    Task<WorkflowMatrix?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default);
}
