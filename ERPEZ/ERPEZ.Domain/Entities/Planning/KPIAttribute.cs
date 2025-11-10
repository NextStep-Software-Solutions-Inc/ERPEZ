using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class KPIAttribute : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid AttributeId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPIId { get; set; }
}
