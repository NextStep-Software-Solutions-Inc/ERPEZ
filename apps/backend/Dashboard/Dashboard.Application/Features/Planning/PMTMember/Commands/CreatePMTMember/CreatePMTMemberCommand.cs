using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMTMember.Commands.CreatePMTMember;

public record CreatePMTMemberCommand : IRequest<ApiResponse<Guid>>
{
    public Guid PMTId { get; init; }
    public Guid UserId { get; init; }
    public string Role { get; init; } = string.Empty;
    public DateTime AppointmentDate { get; init; }
}
