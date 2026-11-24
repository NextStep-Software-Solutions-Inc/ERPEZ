using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class Attribute : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Code { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ParentAttributeId { get; set; }
    public virtual Attribute? ParentAttribute { get; set; }
    public virtual List<Attribute> ParentAttributes { get; set; } = [];
    public virtual List<KPI> KPIs { get; set; } = null!;
}
