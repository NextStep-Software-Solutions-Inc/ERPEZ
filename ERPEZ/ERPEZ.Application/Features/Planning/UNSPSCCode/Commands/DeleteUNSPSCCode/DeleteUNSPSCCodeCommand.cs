using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UNSPSCCode.Commands.DeleteUNSPSCCode;

public record DeleteUNSPSCCodeCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
