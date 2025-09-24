using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class TenantModule : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid TenantId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ModuleId {  get; set; }

    public virtual Tenant Tenant { get; set; } = null!;
    public virtual List<Module> Modules { get; set; } = null!;
}
