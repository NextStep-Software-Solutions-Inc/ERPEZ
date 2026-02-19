using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IWorkflowMatrixRepository : IRepository<WorkflowMatrix>
{
    /// <summary>
    /// Get workflow matrix by ID with FiscalYear and Organization navigation properties included.
    /// </summary>
    Task<WorkflowMatrix?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default);
}
