using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface ISupplierRepository : IRepository<Supplier>
{
    /// <summary>
    /// Get supplier with all related entities loaded (ProcurementCategory, SupplierRequirements).
    /// </summary>
    Task<Supplier?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all suppliers with related entities loaded.
    /// </summary>
    Task<List<Supplier>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if a supplier with the given TIN number exists.
    /// </summary>
    Task<bool> ExistsByTINAsync(string tinNumber, Guid? excludeId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if a supplier with the given Business Permit Number exists.
    /// </summary>
    Task<bool> ExistsByBusinessPermitAsync(string businessPermitNo, Guid? excludeId = null, CancellationToken cancellationToken = default);
}
