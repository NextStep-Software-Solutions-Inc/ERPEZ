using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class KPIModeOfVerification : BaseEntity
{
    public Guid KPIId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Url { get; set; }

}
