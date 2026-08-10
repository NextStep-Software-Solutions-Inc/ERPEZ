using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPActivity.Commands.DeletePPMPActivity;

public record DeletePPMPActivityCommand(Guid Id) : IRequest<ApiResponse<Guid>>;
