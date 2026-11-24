using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.ApprovePPMP;

public record ApprovePPMPCommand(Guid Id, ApprovePPMPRequest? Request = null) : IRequest<ApiResponse<Unit>>;
