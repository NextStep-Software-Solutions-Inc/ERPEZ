using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a parent-child relationship between Object codes for agency sub-ledgers.
/// Enables hierarchical organization of Object codes with optional agency-specific children.
/// </summary>
public class ObjectChildCode : BaseEntity
{
    /// <summary>
    /// The ID of the parent Object.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ParentObjectId { get; set; }

    /// <summary>
    /// The ID of the child Object.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ChildObjectId { get; set; }

    /// <summary>
    /// The name of the child object code relationship.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// The code of the child object relationship.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Description of the child object relationship.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Optional agency ID if this child relationship is agency-specific.
    /// </summary>
    [Sieve(CanFilter = true)]
    public Guid? AgencyId { get; set; }

    /// <summary>
    /// Indicates whether this child relationship is currently active.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; }

    /// <summary>
    /// Navigation property for the parent Object.
    /// </summary>
    public virtual Object? ParentObject { get; set; }

    /// <summary>
    /// Navigation property for the child Object.
    /// </summary>
    public virtual Object? ChildObject { get; set; }
}
