using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRPAP : BaseEntity
{
    public Guid OPCRId { get; set; }
    public Guid KPIId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Budget { get; set; }

    public virtual OPCR OPCR { get; set; } = null!;
    public virtual KPI KPI { get; set; } = null!;
}
