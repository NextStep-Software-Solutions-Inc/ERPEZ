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
    public string Amount { get; set; } = string.Empty;
    public List<OPCR> OPCRs { get; set; } = null!;
    public List<SubDUAllocation> SubDUAllocations { get; set; } = null!;
    public List<DUAllocation> DUAllocations { get; set; } = null!;
    public List<WFP> WFPs { get; set; } = null!;
    public List<DUFundAllocation> DUFundAllocations { get; set; } = null!;
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
    public virtual ReceivedFund ReceivedFund { get; set; } = null!;
}
