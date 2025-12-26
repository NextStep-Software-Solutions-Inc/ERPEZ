using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class KPIPerformanceMeasure : BaseEntity
{
    public Guid KPIId { get; set; }
    public Guid PerformanceMeasureId { get; set; }

    public virtual KPI? KPI { get; set; }
    public virtual PerformanceMeasure? PerformanceMeasure { get; set; }
    public virtual List<Rating> Ratings { get; set; } = [];
}
