using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCR : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DeliveryUnitId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public StatusEnum Status { get; set; } = StatusEnum.Draft;
    
    /// <summary>
    /// Rating workflow status for OPCR Activity Ratings
    /// EF Config: .HasConversion<string>()
    /// Values: Draft, Submitted, Returned
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public OPCRRatingStatus RatingStatus { get; set; } = OPCRRatingStatus.Unknown;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? RatingSubmittedDate { get; set; }
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime? RatingReturnedDate { get; set; }
    
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
    public virtual FiscalYear FiscalYear { get; set; } = null!;
    public virtual List<OPCREvaluation> OPCREvaluations { get; set; } = [];
    public virtual List<DUKPITargetAssignment> DUKPITargetAssignments { get; set; } = [];
    public virtual List<OPCRActivity> OPCRActivities { get; set; } = [];

}
