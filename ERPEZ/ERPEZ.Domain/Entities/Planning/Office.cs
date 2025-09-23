using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class Office : BaseEntity
{
    public string OfficeHead {  get; set; } = string.Empty;
    public string Name { get; set;} = string.Empty;
    public string? Description { get; set; }
    public string Address {  get; set; } = string.Empty;
    public string Email {  get; set; } = string.Empty;
    public string ContactNumber {  get; set; } = string.Empty;
    public string? ResponsibilityCenterCode {  get; set; }
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
}
