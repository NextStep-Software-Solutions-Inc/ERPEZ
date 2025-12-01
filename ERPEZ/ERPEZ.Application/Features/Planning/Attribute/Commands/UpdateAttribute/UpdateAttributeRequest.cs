namespace ERPEZ.Application.Features.Planning.Attribute.Commands.UpdateAttribute;

public record UpdateAttributeRequest
{
    public string? Name { get; init; }
    public string? Code { get; init; }
    public string? Description { get; init; }
    public Guid? ParentAttributeId { get; init; }
}
