using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class MFOKPI : BaseEntity
{
    public Guid MFOPAPId { get; set; }
    public Guid KPIId { get; set; }
    public virtual MFOPAP MFOPAP { get; set; } = null!;
    public virtual KPI KPI { get; set; } = null!;
}
