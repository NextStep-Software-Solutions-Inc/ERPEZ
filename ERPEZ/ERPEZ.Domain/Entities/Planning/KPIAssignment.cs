using ERPEZ.Domain.Common;
using System.Text.Json.Serialization;

namespace ERPEZ.Domain.Entities.Planning;

public class KPIAssignment : BaseEntity
{
    public Guid KPIId { get; set; }
    public Guid DeliveryUnitId { get; set; }
    [JsonIgnore]
    public virtual KPI KPI { get; set; } = null!;
}
