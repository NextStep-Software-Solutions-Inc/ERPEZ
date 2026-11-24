using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.ValidateForAssignment;

public record ValidateForAssignmentQuery(Guid FiscalYearId) : IRequest<ApiResponse<ValidationResult>>;

public record ValidationResult
{
    public bool IsValid { get; init; }
    public int TotalKPIs { get; init; }
    public int KPIsWithTargets { get; init; }
    public int KPIsWithoutTargets { get; init; }
    public List<KPIWithoutTarget> KPIsNeedingTargets { get; init; } = [];
}

public record KPIWithoutTarget
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
}
