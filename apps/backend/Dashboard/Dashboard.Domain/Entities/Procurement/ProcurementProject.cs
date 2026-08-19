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
    public Guid? APPItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public ERPEZ.Domain.Enums.ProcurementProjectSourceType SourceType { get; set; } = ERPEZ.Domain.Enums.ProcurementProjectSourceType.ConsolidatedPR;

    /// <summary>
    /// Snapshot of the MoP shared by all ConsolidatedPRItems included in this project.
    /// Set automatically at project creation — NOT user-editable.
    /// Validated at creation time: all selected items must share the same ProcurementModeId.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ProcurementModeId { get; set; }

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

    [Sieve(CanFilter = true, CanSort = true)]
    public string? ContractNo { get; set; }
    public string?  ScopeOfWork            { get; set; }
    public decimal?  NonRefundableBidderFee { get; set; }
    public int?      DeliveryPeriodDays     { get; set; }

    public Guid? EndUserRepresentativeId { get; set; }
    public Guid? TechRepresentativeId { get; set; }
    public Guid? ApprovalAttachmentFileId { get; set; }
    // Navigation properties
    public virtual ConsolidatedPR? ConsolidatedPR { get; set; }
    public virtual APPItem? APPItem { get; set; }
    public virtual List<BACResolution> BACResolutions { get; set; } = [];
    public virtual List<BiddingActivitySchedule> BiddingActivitySchedules { get; set; } = [];
    public virtual List<DirectContracting> DirectContractings { get; set; } = [];
    [Sieve(CanFilter = true)]
    public virtual ProcurementMode? ProcurementMode { get; set; }

    // Add to ProcurementProject navigation properties
    [Sieve(CanFilter = true)]
    public virtual BiddingDocument? BiddingDocument { get; set; }
    public virtual List<ProjectDocumentChecklist> ProjectDocumentChecklists { get; set; } = [];
    public virtual ERPEZ.Domain.Entities.Planning.User? EndUserRepresentative { get; set; }
    public virtual ERPEZ.Domain.Entities.Planning.User? TechRepresentative { get; set; }
}
