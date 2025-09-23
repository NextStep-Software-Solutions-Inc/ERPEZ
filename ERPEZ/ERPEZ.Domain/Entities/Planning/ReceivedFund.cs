using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class ReceivedFund : BaseEntity
{
    public Guid FundSourceId { get; set; }
    public decimal Amount { get; set; }
    public virtual DUFundAllocation DUFundAllocation { get; set; } = null!;
}
