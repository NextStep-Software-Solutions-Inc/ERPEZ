using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface ISupplierCategoryRepository : IRepository<SupplierCategory>
{
    /// <summary>
    /// Get supplier category with all related entities loaded.
    /// </summary>
    Task<SupplierCategory?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all supplier categories.
    /// </summary>
    Task<List<SupplierCategory>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if a supplier category with the given name exists.
    /// </summary>
    Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);
}
