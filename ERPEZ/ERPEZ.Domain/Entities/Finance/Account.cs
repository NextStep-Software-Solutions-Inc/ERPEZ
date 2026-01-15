using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Finance;

/// <summary>
/// Represents a financial account for an office with a specific fund source in a fiscal year.
/// Composite unique constraint: (OfficeId, FundSourceId, FiscalYearId)
/// </summary>
public class Account : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? FundSourceId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Name { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Balance { get; set; } = 0;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal RunningBalance { get; set; } = 0;
    
    // Navigation properties
    public virtual Office Office { get; set; } = null!;
    public virtual FundSource? FundSource { get; set; }
    public virtual FiscalYear FiscalYear { get; set; } = null!;
    public virtual List<AccountTransaction> OutgoingTransactions { get; set; } = [];
    public virtual List<AccountTransaction> IncomingTransactions { get; set; } = [];
}
