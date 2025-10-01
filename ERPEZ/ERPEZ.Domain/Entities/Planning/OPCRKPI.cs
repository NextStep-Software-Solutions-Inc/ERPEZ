using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRKPI : BaseEntity
{
    public Guid KPIId { get; set; }
    public Guid OPCRId { get; set; }
    public virtual OPCR OPCR { get; set; } = null!;
    public virtual KPI KPI { get; set; } = null!;
    public List<OPCRActivity> OPCRActivities { get; set; } = null!;
    public List<OPCRRating> OPCRRatings { get; set; } = null!;
}
