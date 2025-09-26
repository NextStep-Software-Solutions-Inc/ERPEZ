using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.TenantManagement.Domain.Entities
{
    public sealed class Module : BaseEntity
    {
        public Module() { }
        [Sieve(CanFilter = true, CanSort = true)]
        public string Name { get; set; } = string.Empty;

        [Sieve(CanFilter = true, CanSort = true)]
        public string? Description { get; set; }

        [Sieve(CanFilter = true, CanSort = true)]
        public bool IsActive { get; set; }

        public List<Tenant> Tenants { get; set; } = null!;
    }
}
