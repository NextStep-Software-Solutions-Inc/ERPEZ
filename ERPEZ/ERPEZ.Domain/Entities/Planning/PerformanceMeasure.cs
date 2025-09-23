using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class PerformanceMeasure : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public virtual KPIRating KPIRating { get; set; } = null!;
    public virtual OPCRRating  OPCRRating { get; set; } = null!;
}
