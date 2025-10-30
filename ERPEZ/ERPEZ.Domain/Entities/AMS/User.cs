using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.AMS;

public class User : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string AuthUserId { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid RoleId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string FirstName { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string LastName { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Address { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public virtual List<Permission> Permissions { get; set; } = [];
    public virtual List<Supplier> Suppliers { get; set; } = [];
    public virtual Role Role { get; set; } = null!;
}
