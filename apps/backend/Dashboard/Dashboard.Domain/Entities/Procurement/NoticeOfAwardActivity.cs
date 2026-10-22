using System;
using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

/// <summary>
/// Audit trail activity entry for Notice of Award workflow events.
/// </summary>
public class NoticeOfAwardActivity : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid NoticeOfAwardId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Action { get; set; } = string.Empty;

    public Guid ActorId { get; set; }
    public string ActorName { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime Timestamp { get; set; }

    public string? Notes { get; set; }

    // Navigation properties
    public virtual NoticeOfAward NoticeOfAward { get; set; } = null!;
}
