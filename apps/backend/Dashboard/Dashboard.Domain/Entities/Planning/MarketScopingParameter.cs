using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Market Scoping Parameter - represents parameter evaluation for market scoping.
/// Hierarchy: MarketScoping → MarketScopingParameter → MarketScopingParameterAttachment
/// </summary>
public class MarketScopingParameter : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid MarketScopingId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ParameterId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ParameterSettingsId { get; set; }

    /// <summary>
    /// Nullable boolean indicating if the parameter was considered in the evaluation.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public bool? IsConsidered { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }

    // Navigation properties
    public virtual MarketScoping MarketScoping { get; set; } = null!;
    public virtual MarketScopingParameterSettings ParameterSettings { get; set; } = null!;
    public virtual List<MarketScopingParameterAttachment> Attachments { get; set; } = [];
}

