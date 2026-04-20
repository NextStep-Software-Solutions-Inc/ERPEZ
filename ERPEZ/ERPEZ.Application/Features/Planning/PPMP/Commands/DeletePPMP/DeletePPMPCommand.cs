using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.DeletePPMP;

public record DeletePPMPCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
