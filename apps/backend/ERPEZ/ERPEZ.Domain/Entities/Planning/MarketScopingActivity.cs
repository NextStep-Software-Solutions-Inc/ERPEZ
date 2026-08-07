using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Market Scoping Activity - child entity representing activities conducted during market scoping.
/// Hierarchy: MarketScoping → MarketScopingActivity → MarketScopingActivityAttachment
/// </summary>
public class MarketScopingActivity : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid MarketScopingId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ActivityId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ActivitySettingsId { get; set; }

    // Navigation properties
    public virtual MarketScoping MarketScoping { get; set; } = null!;
    public virtual MarketScopingActivitySettings ActivitySettings { get; set; } = null!;
    public virtual List<MarketScopingActivityAttachment> Attachments { get; set; } = [];
}
