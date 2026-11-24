using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface ISupplierRequirementRepository : IRepository<SupplierRequirement>
{
    /// <summary>
    /// Get supplier requirement with Supplier loaded.
    /// </summary>
    Task<SupplierRequirement?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all requirements for a specific supplier.
    /// </summary>
    Task<List<SupplierRequirement>> GetBySupplierIdAsync(Guid supplierId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if all mandatory requirements for a supplier are verified.
    /// </summary>
    Task<bool> AllMandatoryRequirementsVerifiedAsync(Guid supplierId, CancellationToken cancellationToken = default);
}
