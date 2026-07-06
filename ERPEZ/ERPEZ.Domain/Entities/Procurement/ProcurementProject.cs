using ERPEZ.Domain.Common;
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
    public decimal ABC { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Set to true when BAC Secretariat clicks "Confirm & Lock Checklist".
    /// Prevents further edits to the project document checklist.
    /// Reset to false by the Reset endpoint (only before project is Posted).
    /// </summary>
    public bool ChecklistConfirmed { get; set; } = false;

    // Navigation properties
    public virtual ConsolidatedPR? ConsolidatedPR { get; set; }
    public virtual List<BACResolution> BACResolutions { get; set; } = [];
    public virtual List<BiddingActivitySchedule> BiddingActivitySchedules { get; set; } = [];
}
