using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class KPISDG : BaseEntity
{
    public Guid KPIId { get; set; }
    public Guid SDGId { get; set; }
    public virtual KPI KPI { get; set; } = null!;
    public virtual SDG SDG { get; set; } = null!;
}
