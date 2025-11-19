using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class SubDeliveryUnit : BaseEntity
{
    public Guid DeliveryUnitId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string SubDeliveryUnitHead { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string? ResponsibilityCenterCode { get; set; }

    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
    public virtual List<SubDUAllocation> SubDUAllocations { get; set; } = [];
    public virtual List<WFPPAPDepartment> WFPPAPDepartments { get; set; } = [];
}
