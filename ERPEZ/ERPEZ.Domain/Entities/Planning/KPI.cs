using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class KPI : BaseEntity
{
    public Guid? ParentKPIId { get; set; }
    public string FunctionPercentageAllocationId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; } = string.Empty;
    public bool? IsOfficeMandate { get; set; }
    public virtual KPIRating KPIRating { get; set; } = null!;
    public virtual KPIModeOfVerification KPIModeOfVerification { get; set; } = null!;
    public virtual KPITarget KPITarget { get; set; } = null!;
    public virtual KPIAssignment KPIAssignment { get; set; } = null!;
    public virtual OPCRKPI OPCRKPI { get; set; } = null!;
}
