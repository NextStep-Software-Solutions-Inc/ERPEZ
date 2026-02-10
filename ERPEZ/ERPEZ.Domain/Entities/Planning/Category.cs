using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a category classification for offices.
/// </summary>
public class Category : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool CanHaveChildren { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Navigation property to offices in this category.
    /// </summary>
    public virtual List<Office> Offices { get; set; } = [];
}
