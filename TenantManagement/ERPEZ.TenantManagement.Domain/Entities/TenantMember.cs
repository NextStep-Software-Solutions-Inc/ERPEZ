using ERPEZ.TenantManagement.Domain.Common;
using ERPEZ.TenantManagement.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class TenantMember : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid TenantId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string UserId { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public TenantMemberRole Role { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Status Status { get; set; }

    public virtual Tenant Tenant { get; set; } = null!;
}
