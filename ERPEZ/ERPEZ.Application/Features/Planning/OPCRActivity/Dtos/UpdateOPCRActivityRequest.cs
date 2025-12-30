using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;

public record UpdateOPCRActivityRequest
{
    public Guid? OPCRId { get; init; }
    public Guid? DUKPIAssignmentId { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public decimal? Budget { get; init; }

    [JsonPropertyName("PAPDepartmentIds")]
    public List<Guid>? PAPDepartmentIds { get; init; }
}
