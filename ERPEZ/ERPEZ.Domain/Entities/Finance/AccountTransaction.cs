using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Finance;

/// <summary>
/// Represents a fund transfer transaction between two accounts.
/// Workflow: Draft → Authorized (triggers atomic balance update) → Completed/Failed
/// </summary>
public class AccountTransaction : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FromAccountId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ToAccountId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string Purpose { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal AmountTransfer { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public long Code { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime TransactionDate { get; set; }
    
    /// <summary>
    /// Status workflow: Draft, Pending, Authorized, Completed, Failed
    /// EF Config: .HasConversion&lt;string&gt;()
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public StatusEnum Status { get; set; } = StatusEnum.Draft;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? AuthorizedByUserId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? AuthorizedDate { get; set; }
    
    // Navigation properties
    public virtual Account FromAccount { get; set; } = null!;
    public virtual Account ToAccount { get; set; } = null!;
}
