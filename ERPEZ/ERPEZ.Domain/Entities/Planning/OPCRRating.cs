using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRRating : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OPCREvaluationId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PerformanceMeasureId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OPCRId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DUKPIAssignmentId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public int NumericalRating { get; set; }
    public string? Remarks { get; set; }
    public virtual OPCR OPCR { get; set; } = null!;
    public virtual DUKPIAssignment DUKPIAssignment { get; set; } = null!;
    public virtual OPCREvaluation OPCREvaluation { get; set; } = null!;
    public virtual PerformanceMeasure PerformanceMeasure { get; set; } = null!;
}
