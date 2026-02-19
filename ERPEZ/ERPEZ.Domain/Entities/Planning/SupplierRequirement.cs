using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a compliance document or requirement for a supplier.
/// Tracks verification status for supplier approval workflow.
/// </summary>
public class SupplierRequirement : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string RequirementName { get; set; } = string.Empty;

    /// <summary>
    /// File URL or link to the uploaded requirement document.
    /// </summary>
    public string URL { get; set; } = string.Empty;

    /// <summary>
    /// Indicates if the requirement has been verified by a reviewer.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsVerified { get; set; } = false;

    // Foreign Keys
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SupplierId { get; set; }

    // Navigation Properties
    public virtual Supplier? Supplier { get; set; }
}
