using ERPEZ.Domain.Common;
using Sieve.Attributes;
using System.Text.Json.Serialization;

namespace ERPEZ.Domain.Entities.Planning;

public class WFP : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DUAllocationId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DeliveryUnitId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string ProgramTitle { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public int? FiscalYear { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal ProposedBudget { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string? GeneralObjective { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = string.Empty;
    public virtual DUAllocation DUAllocation { get; set; } = null!;
    public virtual WFPActivity WFPActivity { get; set; } = null!;
    public virtual WFPObjective WFPObjective { get; set; } = null!;
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
    public virtual List<WFPPAP> WFPPAPs { get; set; } = [];
}
