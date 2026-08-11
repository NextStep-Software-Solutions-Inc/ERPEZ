using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class PerformanceMeasure : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public virtual List<KPIPerformanceMeasure> KPIPerformanceMeasures { get; set; } = [];
    public virtual List<OPCRRating> OPCRRatings { get; set; } = [];
}
