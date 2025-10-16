using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class KPITarget : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPIId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TargetValue { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Period { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string? QuarterName { get; set; }
    public virtual KPI KPI { get; set; } = null!;
}
