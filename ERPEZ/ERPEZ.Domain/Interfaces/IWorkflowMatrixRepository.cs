using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface IWorkflowMatrixRepository : IRepository<WorkflowMatrix>
{
    /// <summary>
    /// Get workflow matrix by ID with FiscalYear, Office, and Position navigation properties included.
    /// Actual users are resolved at runtime via PersonnelPosition lookups.
    /// </summary>
    Task<WorkflowMatrix?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all workflow matrices with FiscalYear, Office, and Position navigation properties included.
    /// Returns IQueryable for further filtering and pagination.
    /// </summary>
    IQueryable<WorkflowMatrix> GetAllWithNavigation();

    /// <summary>
    /// Get paged workflow matrices with count for pagination.
    /// </summary>
    Task<(List<WorkflowMatrix> Items, int TotalCount)> GetPagedWithNavigationAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
}
