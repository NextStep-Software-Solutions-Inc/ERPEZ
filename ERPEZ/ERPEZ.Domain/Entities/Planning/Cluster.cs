using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class Cluster : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public virtual List<Office> Offices { get; set; } = [];
}
