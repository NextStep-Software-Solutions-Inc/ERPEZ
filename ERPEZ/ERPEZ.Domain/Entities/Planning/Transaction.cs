using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class Transaction : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FundSourceId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OrganizationId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid LocationId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid MFOPAPId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ObjectId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime TransactionDate { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal AllotedAmount { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? ObligatedAmount { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? DisbursementAmount { get; set; }
    public virtual FundSource FundSource { get; set; } = null!;
    public virtual Organization Organization { get; set; } = null!;
    public virtual Location Location { get; set; } = null!;
    public virtual MFOPAP MFOPAP { get; set; } = null!;
    public virtual Object Object { get; set; } = null!;

}
