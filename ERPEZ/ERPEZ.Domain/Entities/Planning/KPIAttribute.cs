using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class KPIAttribute : BaseEntity
{
    public Guid AttributeId { get; set; }
    public Guid KPIId { get; set; }
    public virtual KPI KPI { get; set; } = null!;
    public virtual Attribute Attribute { get; set; } = null!;
}
