using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Linking table between AOB and ProcurementProject (RFQ).
/// </summary>
public class AOBProcurementProjectMapping : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid AOBId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementProjectId { get; set; }

    // Navigation properties
    public virtual AOB AOB { get; set; } = null!;
    public virtual ProcurementProject ProcurementProject { get; set; } = null!;
}
