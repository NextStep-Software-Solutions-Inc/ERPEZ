using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCR : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DeliveryUnitId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public int FiscalYear { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = string.Empty;
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
    public virtual List<OPCREvaluation> OPCREvaluations { get; set; } = [];
    public virtual List<DUKPIAssignment> DUKPIAssignments { get; set; } = [];
    public virtual List<OPCRActivity> OPCRActivities { get; set; } = [];

}
