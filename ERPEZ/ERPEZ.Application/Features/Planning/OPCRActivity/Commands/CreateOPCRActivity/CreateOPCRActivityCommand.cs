using System.Text.Json.Serialization;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.CreateOPCRActivity;

public record CreateOPCRActivityCommand : IRequest<ApiResponse<Guid>>
{
    public Guid OPCRId { get; init; }
    public Guid DUKPIAssignmentId { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public decimal Budget { get; init; }

    [JsonPropertyName("PAPDepartmentIds")]
    public List<Guid> PAPDepartmentIds { get; init; } = [];
}
