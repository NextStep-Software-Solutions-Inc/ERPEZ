using ERPEZ.TenantManagement.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.TenantManagement.Domain.Entities
{
    public  class Module : BaseEntity
    {
        [Sieve(CanFilter = true, CanSort = true)]
        public string Name { get; set; } = string.Empty;

        [Sieve(CanFilter = true, CanSort = true)]
        public string Description { get; set; } = string.Empty;

        [Sieve(CanFilter = true, CanSort = true)]
        public bool IsActive { get; set; }

        public virtual List<TenantModule> TenantModules { get; set; } = null!;
    }
}
