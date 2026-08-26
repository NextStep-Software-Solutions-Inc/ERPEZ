namespace ERPEZ.Application.Features.Planning.ObjectChildCode.Dtos;

/// <summary>
/// Response DTO for ObjectChildCode.
/// </summary>
public record ObjectChildCodeResponse
{
    public Guid Id { get; init; }
    public Guid ParentObjectId { get; init; }
    public Guid ChildObjectId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid? AgencyId { get; init; }
    public bool IsActive { get; init; }
    public string? ParentObjectName { get; init; }
    public string? ChildObjectName { get; init; }
}

/// <summary>
/// Hierarchical tree node for object hierarchy.
/// </summary>
public record ObjectHierarchyNode
{
    public Guid ObjectId { get; init; }
    public string ObjectCode { get; init; } = string.Empty;
    public string ObjectName { get; init; } = string.Empty;
    public List<ObjectHierarchyNode> Children { get; init; } = [];
}
