using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.AMS;

public class Role : BaseEntity
{

    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Key { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public virtual List<Permission> Permissions { get; set; } = [];
    public virtual List<User> Users { get; set; } = [];
}
