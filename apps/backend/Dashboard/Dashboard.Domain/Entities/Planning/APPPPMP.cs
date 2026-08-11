using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Junction entity representing the selection of a PPMP into an APP.
/// Supports non-exclusive M:M relationship: same PPMP can be selected into multiple APPs.
/// </summary>
public class APPPPMP : BaseEntity
{
    public APPPPMP() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid APPId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PPMPId { get; set; }

    // Navigation properties
    public virtual APP? APP { get; set; }
    public virtual PPMP? PPMP { get; set; }

    // Inherited from BaseEntity:
    // public Guid Id { get; set; }
    // public DateTime CreatedAt { get; set; }
    // public string CreatedBy { get; set; }
    // public DateTime? UpdatedAt { get; set; }
    // public string? UpdatedBy { get; set; }
    // public bool IsDeleted { get; set; }
    // public DateTime? DeletedAt { get; set; }
    // public string? DeletedBy { get; set; }
}
