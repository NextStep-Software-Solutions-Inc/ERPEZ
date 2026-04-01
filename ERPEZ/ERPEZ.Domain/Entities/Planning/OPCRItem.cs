using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRItem : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OPCRId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPIAssignmentId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int Q1Target { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int Q2Target { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int Q3Target { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int Q4Target { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsShopped { get; set; }

    public virtual OPCR OPCR { get; set; } = null!;
    public virtual KPIAssignment KPIAssignment { get; set; } = null!;
    public virtual List<OPCRActivity> OPCRActivities { get; set; } = [];
}
