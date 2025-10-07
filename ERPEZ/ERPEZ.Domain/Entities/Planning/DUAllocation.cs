using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class DUAllocation : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ReceivedFundId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DeliveryUnitId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Purpose { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Amount { get; set; }
    public virtual List<OPCR> OPCRs { get; set; } = [];
    public virtual List<SubDUAllocation> SubDUAllocations { get; set; } = [];
    public virtual List<WFP> WFPs { get; set; } = [];
    public virtual List<DUFundAllocation> DUFundAllocations { get; set; } = [];
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
    public virtual ReceivedFund ReceivedFund { get; set; } = null!;
}
