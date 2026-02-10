using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PositionType.Commands.CreatePositionType;

public record CreatePositionTypeCommand : IRequest<ApiResponse<Guid>>
{
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? EducationalLevel { get; init; }
    public string? Category { get; init; }
    public bool IsCareerEligibilityRequired { get; init; }
    public bool CanReportDirectly { get; init; }
}
