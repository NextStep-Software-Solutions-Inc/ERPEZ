namespace ERPEZ.Domain.Common;

using Sieve.Attributes;

/// <summary>
/// Authoritative abstract base entity for all operational domain entities owned by a tenant.
/// Automatically participates in EF Core Global Query Filtering and write-time tenant stamping.
/// </summary>
public abstract class TenantScopedEntity : BaseEntity, ITenantScopedEntity
{
    protected TenantScopedEntity() { }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid TenantId { get; set; }
}
