using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.AMS;

public class Supplier : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid UserId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string ContactPerson { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Address { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public virtual User User { get; set; } = null!;
}
