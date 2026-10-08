using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a member of a Performance Management Team (PMT).
/// </summary>
public class PMTMember : TenantScopedEntity
{
    /// <summary>
    /// Foreign key to the PMT entity.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PMTId { get; set; }

    /// <summary>
    /// Foreign key to the User entity.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid UserId { get; set; }

    /// <summary>
    /// Role of the member in the PMT (Chair, ViceChair, Member, Secretariat).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string Role { get; set; } = nameof(PMTRoleEnum.Member);

    /// <summary>
    /// Date of appointment to the PMT.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime AppointmentDate { get; set; }

    /// <summary>
    /// End date of the membership (null for ongoing membership).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? EndDate { get; set; }

    /// <summary>
    /// Indicates whether this membership is currently active.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    /// <summary>
    /// The PMT this member belongs to.
    /// </summary>
    public virtual PMT? PMT { get; set; }

    /// <summary>
    /// The user who is a member of the PMT.
    /// </summary>
    public virtual User? User { get; set; }
}
