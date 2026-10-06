using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a supplier/merchant in the vendor master list.
/// Manages compliance and verification of suppliers within the procurement ecosystem.
/// </summary>
public class Supplier : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string BusinessPermitNo { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string ContactPerson { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string ContactNumber { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Email { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string TINNumber { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? PhilGEPSNumber { get; set; }

    /// <summary>
    /// Indicates if the supplier is blocked from new procurement activities.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsBlocked { get; set; } = false;

    /// <summary>
    /// Current approval status: Pending, Approved, or Declined.
    /// Can only be set to Approved if mandatory requirements are verified.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = nameof(SupplierStatusEnum.Pending);

    public string? StatusNote { get; set; }

    // Foreign Keys
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SupplierCategoryId { get; set; }

    // Navigation Properties
    public virtual SupplierCategory? SupplierCategory { get; set; }
    public virtual List<SupplierRequirement> SupplierRequirements { get; set; } = [];
}
