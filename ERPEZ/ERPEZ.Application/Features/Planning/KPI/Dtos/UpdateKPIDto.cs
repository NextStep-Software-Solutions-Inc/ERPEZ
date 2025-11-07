namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public class UpdateKPIDto
{
    public Guid? ParentKPIId { get; set; }
    public string FunctionType { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool? IsOfficeMandate { get; set; }
    public string? Status { get; set; }
}
