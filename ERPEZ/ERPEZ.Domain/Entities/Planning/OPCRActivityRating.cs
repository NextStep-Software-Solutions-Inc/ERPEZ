using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Self-rating or final rating for OPCR Activities
/// Note: Rating status moved to OPCR entity level
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
    
    // Navigation properties
    public virtual OPCRActivity OPCRActivity { get; set; } = null!;
    public virtual PerformanceMeasure PerformanceMeasure { get; set; } = null!;
    public virtual List<OPCRActivityEvaluation> OPCRActivityEvaluations { get; set; } = [];
}
