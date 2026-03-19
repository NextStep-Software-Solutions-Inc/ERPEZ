using ERPEZ.Shared.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.UpdateKPIAssignment;

public record UpdateKPIAssignmentCommand : IRequest<ApiResponse<Unit>>
{
    [JsonIgnore]
    public Guid Id { get; init; }
    public decimal AssignedTargetAnnual { get; init; }
    public decimal? AssignedTargetQ1 { get; init; }
    public decimal? AssignedTargetQ2 { get; init; }
    public decimal? AssignedTargetQ3 { get; init; }
    public decimal? AssignedTargetQ4 { get; init; }
    public bool IsLocked { get; init; }
}
