namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public class UpdateKPIDto
{
    public Guid? ParentKPIId { get; set; }
    public Guid? FunctionPercentageAllocationId { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool? IsOfficeMandate { get; set; }
    public string? Status { get; set; }
}
