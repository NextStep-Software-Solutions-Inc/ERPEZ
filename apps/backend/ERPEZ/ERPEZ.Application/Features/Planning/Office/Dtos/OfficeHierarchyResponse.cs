using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.Office.Dtos;

public record OfficeHierarchyResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public Guid? ParentId { get; init; }
    public string OfficeTypeName { get; init; } = string.Empty;
    public string CategoryName { get; init; } = string.Empty;
    public string AdministrativeLevelName { get; init; } = string.Empty;
    public string? ClusterName { get; init; }
    public bool IsDeleted { get; init; }
    
    [JsonPropertyName("Children")]
    public List<OfficeHierarchyResponse> Children { get; init; } = [];
}
