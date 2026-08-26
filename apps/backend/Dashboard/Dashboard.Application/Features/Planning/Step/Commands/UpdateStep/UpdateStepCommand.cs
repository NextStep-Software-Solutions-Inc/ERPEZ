using ERPEZ.Application.Features.Planning.Step.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Step.Commands.UpdateStep;

public record UpdateStepCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdateStepRequest UpdateStep { get; init; }
}
