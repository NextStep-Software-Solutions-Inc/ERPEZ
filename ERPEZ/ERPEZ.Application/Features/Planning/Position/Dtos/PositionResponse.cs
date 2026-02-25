using ERPEZ.Application.Features.Planning.PlantillaType.Dtos;
using ERPEZ.Application.Features.Planning.PositionType.Dtos;
using ERPEZ.Application.Features.Planning.SalaryGrade.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.Step.Dtos;

namespace ERPEZ.Application.Features.Planning.Position.Dtos;

public record PositionResponse
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public string? FunctionalTitle { get; init; }
    public required string Code { get; init; }
    public string? ItemNumber { get; init; }
    public string? JobDescription { get; init; }
    public string? Qualifications { get; init; }
    public decimal? FTE { get; init; }
    public required string OperationalStatus { get; init; }
    public  PositionTypeResponse? PositionType { get; init; }
    public PlantillaTypeResponse? PlantillaType { get; init; }
    public SalaryGradeResponse? SalaryGrade { get; init; }
    public StepResponse? Step { get; init; }
    public OfficeResponse? Office { get; init; }
}
