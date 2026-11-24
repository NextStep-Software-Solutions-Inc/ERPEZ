using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;
using ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;

namespace ERPEZ.Application.Features.Planning.OPCR.Dtos;

public record OPCRDetailedResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; } = string.Empty;
    public required OfficeResponse Office { get; init; }
    public required FiscalYearResponse FiscalYear { get; init; }
    public required string CommitmentStatus { get; init; } = string.Empty;
    public required string ReviewStatus { get; init; } = string.Empty;
    public DateOnly? SubmittedDate { get; init; }
    public DateOnly? ReturnedDate { get; init; }
    public decimal TotalBudget { get; init; }
    public int EvaluationCount { get; init; }
    public int KPIAssignmentCount { get; init; }
    public int ActivityCount { get; init; }
    public List<OPCREvaluationResponse> OPCREvaluations { get; init; } = [];
    public List<OPCRItemResponse> OPCRItems { get; init; } = [];
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
