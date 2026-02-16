using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Commands.UpdateProcurementPolicyConfig;

public record UpdateProcurementPolicyConfigRequest
{
    public Guid ProcurementModeThresholdId { get; init; }
    public decimal MinAmount { get; init; }
    public decimal? MaxAmount { get; init; }
}

public record UpdateProcurementPolicyConfigCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; init; }
    public Guid ProcurementModeThresholdId { get; init; }
    public decimal MinAmount { get; init; }
    public decimal? MaxAmount { get; init; }
}
