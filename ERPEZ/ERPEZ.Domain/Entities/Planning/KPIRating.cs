using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class KPIRating : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPIId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PerformanceMeasureId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public int NumericalRating { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }
    public virtual KPI KPI { get; set; } = null!;
    public virtual PerformanceMeasure PerformanceMeasure { get; set; } = null!;
}
