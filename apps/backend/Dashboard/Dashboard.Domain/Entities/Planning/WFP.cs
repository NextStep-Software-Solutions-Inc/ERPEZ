using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class WFP : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string ProjectTitle { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? ProjectOwner { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly ProjectStartDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly ProjectEndDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? ProposedBudget { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? GeneralObjective { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public ModeEnum Mode { get; set; } = ModeEnum.External;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? OPCRId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? FundSourceId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public StatusEnum Status { get; set; } = StatusEnum.Draft;

    public DateTime? SubmittedDate { get; set; }

    public DateTime? ApprovedDate { get; set; }

    public virtual List<WFPObjective> WFPObjectives { get; set; } = [];
    public virtual Office Office { get; set; } = null!;
    public virtual OPCR? OPCR { get; set; }
    public virtual FundSource? FundSource { get; set; }
}
