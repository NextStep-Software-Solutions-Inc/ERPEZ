namespace ERPEZ.Application.Features.Planning.Attribute.Dtos;

public class AttributeResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Code { get; set; }
    public string? Description { get; set; }
    public Guid? ParentAttributeId { get; set; }
}
