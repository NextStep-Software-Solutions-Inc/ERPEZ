using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class KPITarget : BaseEntity
{
    public Guid KPIId { get; set; }
    public decimal TargetValue { get; set; }
    public string Period { get; set; } = string.Empty;
    public string? QuarterName { get; set; }
}
