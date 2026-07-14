using ERPEZ.Application.Features.Planning.FYActiveKPI.Dtos;
using ERPEZ.Application.Features.Planning.Office.Dtos;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Dtos;

public record KPIAssignmentResponse
{
    public Guid Id { get; init; }
    public Guid FYActiveKPIId { get; init; }
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;

    // ✅ New flat fields
    public Guid? FiscalYearId { get; init; }
    public int? Year { get; init; }
    public string? FunctionCategory { get; init; }

    public decimal AssignedTargetAnnual { get; init; }
    public decimal? AssignedTargetQ1 { get; init; }
    public decimal? AssignedTargetQ2 { get; init; }
    public decimal? AssignedTargetQ3 { get; init; }
    public decimal? AssignedTargetQ4 { get; init; }
    public bool IsLocked { get; init; }
    public FYActiveKPIResponse? FYActiveKPI { get; init; }
    public OfficeResponse? Office { get; init; }
    public ERPEZ.Application.Features.Planning.FiscalYear.Dtos.FiscalYearResponse? FiscalYear { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}