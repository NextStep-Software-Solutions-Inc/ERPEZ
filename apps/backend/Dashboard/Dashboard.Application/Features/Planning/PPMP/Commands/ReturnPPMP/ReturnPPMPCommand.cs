using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.ReturnPPMP;

public record ReturnPPMPCommand(Guid Id, ReturnPPMPRequest Request) : IRequest<ApiResponse<Unit>>;
