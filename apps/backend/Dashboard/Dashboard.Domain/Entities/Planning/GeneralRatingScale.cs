using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents adjectival rating scales defined per Fiscal Year for performance evaluation.
/// </summary>
public class GeneralRatingScale : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string AdjectivalRatingName { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal MinScore { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal MaxScore { get; set; }

    // Navigation Properties
    public virtual FiscalYear? FiscalYear { get; set; }
}
