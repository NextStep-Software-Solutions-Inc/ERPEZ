using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class FundSource : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ParentId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public FundSourceTypeEnum Type { get; set; } = FundSourceTypeEnum.FundCluster;
    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; }
    public virtual FundSource? ParentSource { get; set; }
    public virtual List<FundSource> FundSources { get; set; } = [];
    public virtual List<ReceivedFund> ReceivedFunds { get; set; } = [];
    public virtual List<Transaction> Transactions { get; set; } = [];
}
