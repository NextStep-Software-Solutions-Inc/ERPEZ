namespace ERPEZ.Application.Features.Planning.Attribute.Dtos;

public class AttributeResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Code { get; init; }
    public string? Description { get; init; }
    public Guid? ParentAttributeId { get; init; }
}
