using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Procurement;

public class BACMember : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string FullName { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Position { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Role { get; set; } = string.Empty; // "Chairperson", "ViceChairperson", "RegularMember"

    public int Order { get; set; } = 0;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;
}
