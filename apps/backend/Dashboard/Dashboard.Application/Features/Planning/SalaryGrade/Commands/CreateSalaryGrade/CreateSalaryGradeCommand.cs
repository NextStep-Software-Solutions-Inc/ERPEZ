using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SalaryGrade.Commands.CreateSalaryGrade;

public record CreateSalaryGradeCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; init; }
    public required string Code { get; init; }
    public required int GradeNumber { get; init; }
    public decimal? StepIncrementAmount { get; init; }
    public required int NumberOfSteps { get; init; }
    public required DateOnly EffectiveDate { get; init; }
    public string? Description { get; init; }
}
