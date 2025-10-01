using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class DUFundAllocation : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DUAllocationId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ReceivedFundId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Amount { get; set; } = string.Empty;
    public virtual DUAllocation DUAllocation { get; set; } = null!;
    public virtual ReceivedFund ReceivedFund { get; set; } = null!;
}
