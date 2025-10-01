using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class ReceivedFund : BaseEntity
{
    public Guid FundSourceId { get; set; }
    public decimal Amount { get; set; }
    public List<DUFundAllocation> DUFundAllocations { get; set; } = null!;
    public List<DUAllocation> DUAllocations { get; set; } = null!;
    public virtual FundSource FundSource { get; set; } = null!; 
}
