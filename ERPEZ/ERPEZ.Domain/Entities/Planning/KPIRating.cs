using ERPEZ.Domain.Common;
using System.Text.Json.Serialization;

namespace ERPEZ.Domain.Entities.Planning;

public class KPIRating : BaseEntity
{
    public Guid KPIId { get; set; }
    public Guid PerformanceMeasureId { get; set; }
    public int NumericalRating { get; set; }
    public string Remarks { get; set; } = string.Empty;
    [JsonIgnore]
    public virtual KPI KPI { get; set; } = null!;
}
