using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class Rating : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public int NumericalRating { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }

    // Explicit foreign key to KPIPerformanceMeasure
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPIPerformanceMeasureId { get; set; }
    public virtual KPIPerformanceMeasure? KPIPerformanceMeasure { get; set; }
}

