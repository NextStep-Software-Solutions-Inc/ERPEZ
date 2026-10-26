using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.TogglePPMPFinalization;

public record TogglePPMPFinalizationCommand(Guid Id, bool IsFinal) : IRequest<ApiResponse<Unit>>;
