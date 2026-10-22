using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Market Scoping History - audit trail for status changes on market scoping records.
/// Tracks all status transitions with timestamp and user information.
/// </summary>
public class MarketScopingHistory : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid MarketScopingId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public StatusEnum PreviousStatus { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public StatusEnum NewStatus { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? ChangeReason { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime ChangedAt { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string ChangedBy { get; set; } = string.Empty;

    // Navigation properties
    public virtual MarketScoping MarketScoping { get; set; } = null!;
}
