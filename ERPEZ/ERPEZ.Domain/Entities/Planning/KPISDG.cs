using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class KPISDG : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPIId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid SDGId { get; set; }
}
