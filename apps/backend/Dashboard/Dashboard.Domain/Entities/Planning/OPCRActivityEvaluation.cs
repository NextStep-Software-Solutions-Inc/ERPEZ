using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Evaluation record to "confirm" the score or not
/// Status: Pending, Evaluated, Returned (enum converted to string in DB)
/// Validation: 
/// 1. KPI Alignment: Verify that the PerformanceMeasureId being rated actually
///    belongs to the KPI that was linked to that specific OPCRActivity. The same
///    happens to OPCRActivityMOV
/// 2. OPCRActivityRating.OPCRActivityId == OPCRActivityMOV.OPCRActivityId
/// Process:
/// 1. Select Activity A,
/// 2. Join all MOV records where ActivityId = A
/// 3. Join all Rating records where ActivityId = A
/// 4. For each Rating, the Planning Unit creates an Evaluation record to
///    "Confirm" the score or not. 
/// </summary>
public class OPCRActivityEvaluation : TenantScopedEntity
{
    public OPCRActivityEvaluation() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OPCRActivityRatingId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public int EvaluatorScore { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Remarks { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? EvaluatedDate { get; set; }
    
    /// <summary>
    /// EF Config: .HasConversion<string>()
    /// Values: Pending, Evaluated, Returned
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public OPCREvaluationStatus Status { get; set; }
    
    // Navigation properties
    public virtual OPCRActivityRating OPCRActivityRating { get; set; } = null!;
}
