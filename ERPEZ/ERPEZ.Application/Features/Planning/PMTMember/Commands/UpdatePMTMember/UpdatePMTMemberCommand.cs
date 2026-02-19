using ERPEZ.Application.Features.Planning.PMTMember.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMTMember.Commands.UpdatePMTMember;

public record UpdatePMTMemberCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdatePMTMemberRequest UpdatePMTMember { get; init; }
}
