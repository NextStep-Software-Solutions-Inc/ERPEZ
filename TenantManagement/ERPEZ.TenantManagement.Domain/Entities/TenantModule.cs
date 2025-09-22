using ERPEZ.TenantManagement.Domain.Common;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class TenantModule : BaseEntity
{
    public Guid TenantId { get; set; }
    public Guid ModuleId {  get; set; }

    public virtual Tenant Tenant { get; set; } = null!;
    public virtual Module Module { get; set; } = null!;
}
