using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCR : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;

    // <summary>
    /// Commitment workflow status.
    /// Values: Draft, Submitted, Returned, Approved
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string CommitmentStatus { get; set; } = "Draft";

    /// <summary>
    /// Review workflow status.
    /// Values: Pending, Draft, Submitted, Returned, Finalized
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string ReviewStatus { get; set; } = "Pending";
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? SubmittedDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? ApprovedDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }
    public virtual Office Office { get; set; } = null!;
    public virtual FiscalYear FiscalYear { get; set; } = null!;
    public virtual List<OPCREvaluation> OPCREvaluations { get; set; } = [];
    public virtual List<DUKPITargetAssignment> DUKPITargetAssignments { get; set; } = [];
    public virtual List<OPCRItem> OPCRItems { get; set; } = [];

}
