using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Commands.CreatePersonnelPosition;

public record CreatePersonnelPositionCommand : IRequest<ApiResponse<Guid>>
{
    public Guid UserId { get; init; }
    public Guid PositionId { get; init; }
    public string AssignmentType { get; init; } = string.Empty;
    public bool IsActive { get; init; } = true;
    public DateTime StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}
