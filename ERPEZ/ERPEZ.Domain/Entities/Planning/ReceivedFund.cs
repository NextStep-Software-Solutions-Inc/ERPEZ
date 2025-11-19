using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class ReceivedFund : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FundSourceId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Amount { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime ReceivedDate { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }
    public virtual List<DUFundAllocation> DUFundAllocations { get; set; } = [];
    public virtual List<DUAllocation> DUAllocations { get; set; } = [];
    public virtual FundSource FundSource { get; set; } = null!;
}
