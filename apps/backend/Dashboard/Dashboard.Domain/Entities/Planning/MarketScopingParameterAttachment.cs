using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Market Scoping Parameter Attachment - stores file attachments for market scoping parameter evaluations.
/// </summary>
public class MarketScopingParameterAttachment : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid MarketScopingParameterId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string FileUrl { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string FileName { get; set; } = string.Empty;

    // Navigation properties
    public virtual MarketScopingParameter MarketScopingParameter { get; set; } = null!;
}
