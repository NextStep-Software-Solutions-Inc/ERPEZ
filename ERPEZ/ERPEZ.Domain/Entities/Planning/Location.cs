using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class Location : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ParentId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Type { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; }
    public virtual Location? ParentLocation { get; set; }
    public virtual List<Location> Locations { get; set; } = [];
    public virtual List<Transaction> Transactions { get; set; } = [];
}
