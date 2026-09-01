using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Direct Acquisition (RA 12009) — Alternative Procurement mode for low-value purchases (ABC <= 200,000).
/// Bypasses competitive bidding and quotation procedures while maintaining audit integrity and routing
/// to disbursement voucher processing upon recording purchase and approval.
/// </summary>
public class DirectAcquisition : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string DANumber { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ConsolidatedPRId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? BACProjectId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalABC { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DirectAcquisitionStatusEnum Status { get; set; } = DirectAcquisitionStatusEnum.DRAFT;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? CreatedByUserId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ReviewedByUserId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ApprovedFileId { get; set; }

    // Navigation properties
    public virtual ConsolidatedPR ConsolidatedPR { get; set; } = null!;
    public virtual ProcurementProject? BACProject { get; set; }
    public virtual DirectPurchaseEntry? DirectPurchaseEntry { get; set; }
    public virtual List<DirectAcquisitionDocument> Documents { get; set; } = [];
}
