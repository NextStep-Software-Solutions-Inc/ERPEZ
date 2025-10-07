using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class FunctionPercentageAllocation : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Function { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Percentage { get; set; }
    public virtual List<KPI> KPIs { get; set; } = [];
}
