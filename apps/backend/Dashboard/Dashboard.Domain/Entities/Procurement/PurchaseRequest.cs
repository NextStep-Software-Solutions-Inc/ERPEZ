using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;
using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Entities.Procurement;

public class PurchaseRequest : ApprovableEntity
{
    public PurchaseRequest() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public string PRNumber { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? PPMPId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ProcurementProjectId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Purpose { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public PRType PRType { get; set; } = PRType.NonCSE;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? FundSourceId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? UACSCodeCombinationId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ProcurementCategoryId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly RequestedDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalAmount { get; set; }

    public virtual Office Office { get; set; } = null!;
    public virtual FundSource? FundSource { get; set; }
    public virtual PPMP? PPMP { get; set; }
    public virtual ProcurementProject? ProcurementProject { get; set; }
    public virtual UACSCodeCombination? UACSCodeCombination { get; set; }
    public virtual ProcurementCategory? ProcurementCategory { get; set; }
    public virtual List<PRItem> PRItems { get; set; } = [];
    public virtual List<ApprovalEvent> ApprovalEvents { get; set; } = [];

    public bool IsLocked => Status != StatusEnum.Draft && Status != StatusEnum.Returned;
}