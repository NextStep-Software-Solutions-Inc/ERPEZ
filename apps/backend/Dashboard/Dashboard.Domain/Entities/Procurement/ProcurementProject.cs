using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Represents a procurement project derived from an APP Item or a consolidated PR.
/// </summary>
public class ProcurementProject : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Title { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public ProcurementProjectSourceType SourceType { get; set; } = ProcurementProjectSourceType.ConsolidatedPR;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? APPItemId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ConsolidatedPRId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FundSourceId { get; set; }

    /// <summary>
    /// Snapshot of the MoP shared by the source items.
    /// Set automatically at project creation — NOT user-editable.
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
    public virtual APPItem? APPItem { get; set; }
    public virtual ConsolidatedPR? ConsolidatedPR { get; set; }
    public virtual Office Office { get; set; } = null!;
    public virtual FundSource FundSource { get; set; } = null!;
    public virtual List<BACResolution> BACResolutions { get; set; } = [];
    public virtual List<BiddingActivitySchedule> BiddingActivitySchedules { get; set; } = [];
    public virtual List<DirectContracting> DirectContractings { get; set; } = [];
    public virtual List<PurchaseRequest> PurchaseRequests { get; set; } = [];

    [Sieve(CanFilter = true)]
    public virtual ProcurementMode? ProcurementMode { get; set; }

    [Sieve(CanFilter = true)]
    public virtual BiddingDocument? BiddingDocument { get; set; }
    public virtual List<ProjectDocumentChecklist> ProjectDocumentChecklists { get; set; } = [];
    public virtual ERPEZ.Domain.Entities.Planning.User? EndUserRepresentative { get; set; }
    public virtual ERPEZ.Domain.Entities.Planning.User? TechRepresentative { get; set; }
}
