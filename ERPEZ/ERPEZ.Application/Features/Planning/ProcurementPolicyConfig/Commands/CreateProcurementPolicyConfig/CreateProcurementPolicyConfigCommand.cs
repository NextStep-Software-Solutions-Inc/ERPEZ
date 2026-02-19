using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Commands.CreateProcurementPolicyConfig;

public record CreateProcurementPolicyConfigCommand : IRequest<ApiResponse<Guid>>
{
    public Guid FiscalYearId { get; init; }
    public Guid ProcurementModeId { get; init; }
    public Guid ProcurementModeThresholdId { get; init; }
    public decimal MinAmount { get; init; }
    public decimal? MaxAmount { get; init; }
}
