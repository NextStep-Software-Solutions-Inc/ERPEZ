using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Step.Commands.CreateStep;

public record CreateStepCommand : IRequest<ApiResponse<Guid>>
{
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public int StepNumber { get; init; }
    public int MinStep { get; init; }
    public int MaxStep { get; init; }
    public string? Description { get; init; }
}
