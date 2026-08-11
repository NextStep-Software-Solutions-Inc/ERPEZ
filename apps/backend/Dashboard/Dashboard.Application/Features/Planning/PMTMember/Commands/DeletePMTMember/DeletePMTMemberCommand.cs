using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMTMember.Commands.DeletePMTMember;

public record DeletePMTMemberCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
