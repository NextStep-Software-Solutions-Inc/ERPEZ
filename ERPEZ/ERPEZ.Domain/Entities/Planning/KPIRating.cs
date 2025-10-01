using ERPEZ.Domain.Common;
using Sieve.Attributes;
using System.Text.Json.Serialization;

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
    public string Remarks { get; set; } = string.Empty;
    [JsonIgnore]
    public virtual KPI KPI { get; set; } = null!;
    [JsonIgnore]
    public virtual PerformanceMeasure PerformanceMeasure { get; set; } = null!;
}
