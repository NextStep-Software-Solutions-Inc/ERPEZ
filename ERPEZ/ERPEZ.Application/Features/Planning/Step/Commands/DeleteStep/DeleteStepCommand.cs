using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Step.Commands.DeleteStep;

public record DeleteStepCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
