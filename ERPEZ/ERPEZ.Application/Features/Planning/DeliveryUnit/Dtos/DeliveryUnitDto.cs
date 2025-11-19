namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;

public class DeliveryUnitDto
{
    public Guid Id { get; set; }
    public Guid OfficeId { get; set; }
    public Guid? ParentDUId { get; set; }
}
