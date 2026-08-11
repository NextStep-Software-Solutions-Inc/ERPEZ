using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Market Scoping Activity Settings - represents reusable activity settings for market scoping.
/// Stores master data for activities that can be conducted during multiple market scoping instances.
/// </summary>
public class MarketScopingActivitySettings : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string ActivityType { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Label { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int SortOrder { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual List<MarketScopingActivity> MarketScopingActivities { get; set; } = [];
}
