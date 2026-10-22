namespace ERPEZ.Domain.Common;

/// <summary>
/// Authoritative interface contract for all operational domain entities owned by a tenant.
/// Guarantees compile-time and runtime tenant attribution for EF Core query filters and auditing interceptors.
/// </summary>
public interface ITenantScopedEntity
{
    /// <summary>
    /// The unique identifier of the tenant organization owning this record.
    /// </summary>
    Guid TenantId { get; set; }
}
