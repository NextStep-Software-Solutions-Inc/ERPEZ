using ERPEZ.TenantManagement.Domain.Common;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class Module : BaseEntity
{
    public Guid Name { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }

    public virtual List<TenantModule> TenantModules { get; set; } = [];
}
