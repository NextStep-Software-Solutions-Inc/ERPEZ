using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Performance;

/// <summary>
/// Means of Verification for OPCR Activities
/// Note: For self rating, the Evaluator Id is the DeliveryUnitId.  
///       For final rating, the EvaluatorId is the Planning user Id.
/// </summary>
public class OPCRActivityMOV : BaseEntity
{
    public OPCRActivityMOV() { }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OPCRActivityId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string FileName { get; set; } = string.Empty;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Url { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? UploadedDate { get; set; }
}
