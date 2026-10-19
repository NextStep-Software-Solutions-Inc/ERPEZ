using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a Whereas clause used in BAC resolutions.
/// </summary>
public class BACResolutionWhereasClause : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Body { get; set; } = string.Empty;
}
