using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class FiscalYear : BaseEntity
{
    public int Year { get; set; }
    public string? Description { get; set; }
    public bool IsLocked { get; set; } = false;
}
