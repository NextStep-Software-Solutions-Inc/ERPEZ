using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class OrganizationFundSource : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OrganizationId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FundSourceId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    public virtual Organization Organization { get; set; } = null!;
    public virtual FundSource FundSource { get; set; } = null!;
}
