using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class DUFundAllocation : BaseEntity
{
    public Guid DUAllocationId { get; set; }
    public Guid ReceivedFundId { get; set; }
    public string Amount { get; set; } = string.Empty;
}
