using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Market Scoping Activity Attachment - stores file attachments for market scoping activities.
/// </summary>
public class MarketScopingActivityAttachment : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid MarketScopingActivityId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string FileUrl { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string FileName { get; set; } = string.Empty;

    // Navigation properties
    public virtual MarketScopingActivity MarketScopingActivity { get; set; } = null!;
}
