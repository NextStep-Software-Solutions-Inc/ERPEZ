using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a personnel assignment to a position.
/// </summary>
public class PersonnelPosition : TenantScopedEntity
{
    /// <summary>
    /// Foreign key to the User entity.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid UserId { get; set; }

    /// <summary>
    /// Foreign key to the Position entity.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PositionId { get; set; }

    /// <summary>
    /// Type of assignment (Permanent or OIC).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string AssignmentType { get; set; } = nameof(AssignmentTypeEnum.Permanent);

    /// <summary>
    /// Indicates whether this assignment is currently active.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Start date of the assignment.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime StartDate { get; set; }

    /// <summary>
    /// End date of the assignment (null for ongoing assignments).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? EndDate { get; set; }

    // Navigation Properties
    /// <summary>
    /// The user assigned to the position.
    /// </summary>
    public virtual User? User { get; set; }

    /// <summary>
    /// The position being assigned.
    /// </summary>
    public virtual Position? Position { get; set; }
}
