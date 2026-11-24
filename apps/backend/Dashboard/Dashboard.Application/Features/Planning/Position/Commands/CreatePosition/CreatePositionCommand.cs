using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Position.Commands.CreatePosition;

public record CreatePositionCommand : IRequest<ApiResponse<Guid>>
{
    public string Title { get; init; } = string.Empty;
    public string? FunctionalTitle { get; init; }
    public string Code { get; init; } = string.Empty;
    public string? ItemNumber { get; init; }
    public string? JobDescription { get; init; }
    public string? Qualifications { get; init; }
    public decimal? FTE { get; init; }
    public string OperationalStatus { get; init; } = "Vacant";
    public Guid PositionTypeId { get; init; }
    public Guid PlantillaTypeId { get; init; }
    public Guid SalaryGradeId { get; init; }
    public Guid StepId { get; init; }
    public Guid OfficeId { get; init; }
}
