using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

public class DirectContracting : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string DCNumber { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid BACProjectId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ExclusiveSupplierId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime SubmissionDeadline { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DirectContractingStatusEnum Status { get; set; } = DirectContractingStatusEnum.DRAFT;

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TotalABC { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? ReviewRemarks { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? CreatedByUserId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ReviewedByUserId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ApprovedFileId { get; set; }

    // Navigation properties
    public virtual ProcurementProject BACProject { get; set; } = null!;
    public virtual Supplier ExclusiveSupplier { get; set; } = null!;
    public virtual DirectContractingProposal? Proposal { get; set; }
}
