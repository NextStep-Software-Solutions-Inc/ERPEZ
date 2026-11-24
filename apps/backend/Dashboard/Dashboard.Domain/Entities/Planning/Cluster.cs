using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class Cluster : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Address { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int? MaxSubUnits { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;

    public virtual List<Office> Offices { get; set; } = [];
}
