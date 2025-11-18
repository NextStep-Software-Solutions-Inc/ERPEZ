namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public class AttributeResponse
{
    public Guid Id { get; set; }
    public Guid? ParentAttributeId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Code { get; set; }
}
