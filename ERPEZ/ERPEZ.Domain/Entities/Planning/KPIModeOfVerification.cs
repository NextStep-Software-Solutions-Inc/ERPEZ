using ERPEZ.Domain.Common;
using System.Text.Json.Serialization;

namespace ERPEZ.Domain.Entities.Planning;

public class KPIModeOfVerification : BaseEntity
{
    public Guid KPIId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Url { get; set; }
    [JsonIgnore]
    public virtual KPI KPI { get; set; } = null!;

}
