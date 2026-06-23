using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents a procurement project derived from a consolidated PR.
/// </summary>
public class ProcurementProject : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Title { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ConsolidatedPRId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ModeOfProcurementId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal ABC { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = string.Empty;

    // Navigation properties
    public virtual ProcurementMode ModeOfProcurement { get; set; } = null!;
    public virtual List<BACResolution> BACResolutions { get; set; } = [];
    public virtual List<BiddingActivitySchedule> BiddingActivitySchedules { get; set; } = [];
}
