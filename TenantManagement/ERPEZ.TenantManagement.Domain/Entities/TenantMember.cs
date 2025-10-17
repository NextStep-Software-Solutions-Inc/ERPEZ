using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class TenantMember : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid TenantId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string UserId { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Role { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = string.Empty;

    public virtual Tenant Tenant { get; set; } = null!;
}
