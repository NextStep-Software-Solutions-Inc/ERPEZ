using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class FunctionPercentageAllocation : BaseEntity
{
    public string Function { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Percentage { get; set; }
}
