using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class KPIModeOfVerification : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPIId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    public string? Url { get; set; }
    public virtual KPI KPI { get; set; } = null!;

}
