using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class KPITarget : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPIId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TargetValue { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public PeriodEnum Period { get; set; } = PeriodEnum.Quarterly;
    [Sieve(CanFilter = true, CanSort = true)]
    public string? QuarterName { get; set; }
    public virtual KPI KPI { get; set; } = null!;
    public List<KPITarget> KPITargets { get; set; } = [];
}
