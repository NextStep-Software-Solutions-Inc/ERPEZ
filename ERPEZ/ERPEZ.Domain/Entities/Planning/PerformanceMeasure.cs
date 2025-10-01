using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class PerformanceMeasure : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<KPIRating> KPIRatings { get; set; } = null!;
    public List<OPCRRating> OPCRRatings { get; set; } = null!;
}
