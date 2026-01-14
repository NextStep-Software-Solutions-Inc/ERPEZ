using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Performance;

/// <summary>
/// Self-rating or final rating for OPCR Activities
/// Status: Draft, Submitted, Returned (enum converted to string in DB)
/// </summary>
public class OPCRActivityRating : BaseEntity
{
    public OPCRActivityRating() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OPCRActivityId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid PerformanceMeasureId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int ActualAccomplishedValue { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int Score { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }
    
    /// <summary>
    /// EF Config: .HasConversion<string>()
    /// Values: Draft, Submitted, Returned
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public OPCRActivityRatingStatus Status { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? SubmittedDate { get; set; }
}
