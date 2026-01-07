using System.Text.Json.Serialization;
using ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Dtos;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;

public record OPCRActivityResponse
{
    public Guid Id { get; init; }
    public Guid OPCRId { get; init; }
    public Guid DUKPITargetAssignmentId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal Budget { get; init; }

    [JsonPropertyName("PAPDepartments")]
    public List<OPCRPAPDepartmentResponse> PAPDepartments { get; init; } = [];
}
