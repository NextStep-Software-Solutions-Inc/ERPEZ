using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Persistent signatory configuration for an Annual Procurement Plan (APP).
/// Serves as an APP-specific signatory assignment linking to master personnel records (User + PersonnelPosition).
/// Includes snapshot display fields (Name, Position, Department) to protect historical APP documents from position changes.
/// </summary>
public class APPSignatory : BaseEntity
{
    public APPSignatory() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid APPId { get; set; }

    /// <summary>
    /// Foreign key to User (master personnel record).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? UserId { get; set; }

    /// <summary>
    /// Foreign key to PersonnelPosition assignment.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? PersonnelPositionId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string RoleKey { get; set; } = string.Empty; // preparedBy, reviewedBy, approvedBy, certifiedBy

    [Sieve(CanFilter = true, CanSort = true)]
    public int SequenceOrder { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? SignatureDate { get; set; }

    // Snapshot display fields to preserve exact historical document representation
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Position { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Department { get; set; } = string.Empty;

    // Navigation properties
    public virtual APP APP { get; set; } = null!;
    public virtual User? User { get; set; }
    public virtual PersonnelPosition? PersonnelPosition { get; set; }
}
