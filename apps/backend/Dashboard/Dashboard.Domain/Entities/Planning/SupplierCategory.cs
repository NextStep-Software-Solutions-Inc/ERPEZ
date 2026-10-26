using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a category for supplier/merchant classification.
/// </summary>
public class SupplierCategory : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    // Navigation Properties
    public virtual List<Supplier> Suppliers { get; set; } = [];
}
