using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class Object : BaseEntity
{
    public Guid? ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public virtual ActivityBudgetRequirement ActivityBudgetRequirement { get; set; } = null!;
    public virtual Transaction Transaction { get; set; } = null!;
}
