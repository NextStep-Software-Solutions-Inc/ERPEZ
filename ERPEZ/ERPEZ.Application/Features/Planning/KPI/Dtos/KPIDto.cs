namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public class KPIDto
{
    public Guid Id { get; set; }
    public Guid? ParentKPIId { get; set; }
    public string FunctionType { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; } = string.Empty;
    public bool? IsOfficeMandate { get; set; }
    public string Status { get; set; } = string.Empty;
}
