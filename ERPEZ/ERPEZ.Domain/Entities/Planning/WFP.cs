using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class WFP : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DeliveryUnitId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string ProjectTitle { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? FiscalYearId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly ProjectStartDate { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly ProjectEndDate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? ProposedBudget { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string? GeneralObjective { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public StatusEnum Status { get; set; } = StatusEnum.Draft;
    public virtual List<WFPActivity> WFPActivities { get; set; } = [];
    public virtual List<WFPObjective> WFPObjectives { get; set; } = [];
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
    public virtual FiscalYear? FiscalYear { get; set; }
}
