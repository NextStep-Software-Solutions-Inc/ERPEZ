using ERPEZ.Domain.Common;
using Sieve.Attributes;
using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Join record linking a ConsolidatedPR to an individual PurchaseRequest.
///
/// The Consolidation workbench (Image 13) adds two columns per line item
/// that are NOT present on the originating PR:
///   - Mode Of Procurement (dropdown, e.g. "Small Value Procurement")
///   - Allow Partial (checkbox)
///
/// These are set by the Procurement Officer during consolidation review,
/// so they live here rather than on PRItem.
///
/// A single PurchaseRequest is linked at the PR level (Image 11/12),
/// but the MOP and AllowPartial are displayed and set per PRItem line in the UI.
/// We therefore join at the PRItem level for granularity.
/// </summary>
public class ConsolidatedPRItem : BaseEntity
{
    public ConsolidatedPRItem() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ConsolidatedPRId { get; set; }

    /// <summary>The originating PR (header level — matches "PR-001 • Office A" grouping in Image 13).</summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PurchaseRequestId { get; set; }

    /// <summary>The specific line item from the originating PR.</summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PRItemId { get; set; }

    /// <summary>
    /// Mode of Procurement assigned by Procurement Officer during consolidation (Image 13).
    /// References ProcurementMode lookup table.
    /// Nullable until set (shown as "Select" dropdown in Image 13).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ProcurementModeId { get; set; }

    /// <summary>
    /// Allow Partial Delivery checkbox from Image 13.
    /// Indicates whether the supplier may deliver items partially.
    /// </summary>
    public bool AllowPartial { get; set; } = false;

    // Navigation
    public virtual ConsolidatedPR ConsolidatedPR { get; set; } = null!;
    public virtual PurchaseRequest PurchaseRequest { get; set; } = null!;
    public virtual PRItem PRItem { get; set; } = null!;
    public virtual ProcurementMode? ProcurementMode { get; set; }
}