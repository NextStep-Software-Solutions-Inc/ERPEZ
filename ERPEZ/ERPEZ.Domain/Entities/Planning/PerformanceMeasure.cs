using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class PerformanceMeasure : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public virtual List<KPIRating> KPIRatings { get; set; } = [];
    public virtual List<OPCRRating> OPCRRatings { get; set; } = [];
}
