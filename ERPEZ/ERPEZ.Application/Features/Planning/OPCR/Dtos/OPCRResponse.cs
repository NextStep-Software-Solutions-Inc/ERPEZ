using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;
using ERPEZ.Application.Features.Planning.FiscalYear.Dtos;
using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;
using ERPEZ.Application.Features.Planning.OPCREvaluation.Dtos;

namespace ERPEZ.Application.Features.Planning.OPCR.Dtos;

public record OPCRResponse
{
    public Guid Id { get; init; }
    public required DeliveryUnitResponse DeliveryUnit { get; init; }
    public required FiscalYearResponse FiscalYear { get; init; }
    public string Status { get; init; } = string.Empty;
    public required string Name { get; init; }
    public required decimal TotalBudget { get; init; }
    public DateOnly CreatedDate { get; init; }

    public List<OPCREvaluationResponse> OPCREvaluations { get; init; } = [];
    public List<DUKPIAssignmentResponse> DUKPIAssignments { get; init; } = [];
    public List<OPCRActivityResponse> OPCRActivities { get; init; } = [];

}
